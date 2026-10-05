#!/usr/bin/env python3
"""Validate signed bridge releases and publish only updates/bridge on OVH.

The private signing key is never needed here. The public key in the checked-out
release directory is the trust anchor; a key downloaded from OVH is not trusted.
"""
from __future__ import annotations

import argparse
import base64
import errno
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys
import time
import urllib.request
import uuid

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

BASE_URL = "https://sourireplus.ch/updates/bridge/"
REMOTE_DIR = "updates/bridge"
MAX_EXE = 80 * 1024 * 1024
MAX_MANIFEST = 32 * 1024
VERSION = re.compile(r"(?:0|[1-9][0-9]{0,8})(?:\.(?:0|[1-9][0-9]{0,8})){2}\Z")


class PublishError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise PublishError(message)


def no_duplicates(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "Duplicate JSON field.")
        result[key] = value
    return result


def parse_json(raw):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=no_duplicates)
    except (ValueError, UnicodeError) as exc:
        raise PublishError("Invalid manifest JSON.") from exc


def decode_b64(value):
    require(isinstance(value, str), "Invalid base64 field.")
    try:
        return base64.b64decode(value, validate=True)
    except ValueError as exc:
        raise PublishError("Invalid base64 field.") from exc


def read_local(path, limit):
    require(stat.S_ISREG(path.lstat().st_mode), "Release source must be a regular file.")
    require(path.stat().st_size <= limit, "Release source exceeds size limit.")
    raw = path.read_bytes()
    require(len(raw) <= limit, "Release source exceeds size limit.")
    return raw


def load_public_key(raw):
    require(len(raw) < 1024, "Public key file too large.")
    try:
        key = decode_b64(raw.decode("ascii").strip())
    except UnicodeError as exc:
        raise PublishError("Invalid public key.") from exc
    require(len(key) == 32, "Invalid Ed25519 public key length.")
    return key


def verify_manifest(raw, public_key):
    require(len(raw) <= MAX_MANIFEST, "Manifest exceeds size limit.")
    envelope = parse_json(raw)
    require(isinstance(envelope, dict) and set(envelope) == {"payload", "signature"}, "Invalid signed envelope.")
    payload_bytes = decode_b64(envelope["payload"])
    signature = decode_b64(envelope["signature"])
    require(len(signature) == 64, "Invalid signature length.")
    try:
        Ed25519PublicKey.from_public_bytes(public_key).verify(signature, payload_bytes)
    except InvalidSignature as exc:
        raise PublishError("Manifest signature verification failed.") from exc
    payload = parse_json(payload_bytes)
    require(isinstance(payload, dict), "Invalid release metadata.")
    require(set(payload) == {"schema", "product", "channel", "release", "version", "platform", "url", "size", "sha256", "min_launcher"}, "Unexpected release fields.")
    require(type(payload["schema"]) is int and payload["schema"] == 1, "Unsupported schema.")
    require(payload["product"] == "sourireplus-bridge" and payload["channel"] == "stable" and payload["platform"] == "windows-x64", "Wrong product, channel or platform.")
    for field in ("release", "min_launcher"):
        require(type(payload[field]) is int and payload[field] > 0, "Invalid release or launcher sequence.")
    require(isinstance(payload["version"], str) and VERSION.fullmatch(payload["version"]), "Invalid version.")
    name = f"SourirePlusBridge-{payload['version']}.exe"
    require(payload["url"] == BASE_URL + name, "Artifact URL must use the fixed SourirePlus HTTPS directory.")
    require(type(payload["size"]) is int and 2 <= payload["size"] <= MAX_EXE, "Invalid executable size.")
    require(isinstance(payload["sha256"], str) and re.fullmatch(r"[0-9a-f]{64}", payload["sha256"]), "Invalid executable digest.")
    return payload


def check_executable(raw, payload):
    require(raw[:2] == b"MZ", "Artifact is not a Windows executable.")
    require(len(raw) == payload["size"] and hashlib.sha256(raw).hexdigest() == payload["sha256"], "Executable size or digest does not match the signed manifest.")


def load_release(directory):
    public_bytes = read_local(directory / "public-key.txt", 1024)
    public_key = load_public_key(public_bytes)
    manifest = read_local(directory / "manifest.json", MAX_MANIFEST)
    payload = verify_manifest(manifest, public_key)
    name = payload["url"].removeprefix(BASE_URL)
    require({p.name for p in directory.iterdir()} == {name, "manifest.json", "public-key.txt"}, "Release directory must contain exactly the manifest, public key and signed executable.")
    executable = read_local(directory / name, MAX_EXE)
    check_executable(executable, payload)
    return public_key, manifest, payload, executable


def check_progression(current, candidate, public_key):
    if current is None:
        return
    before = verify_manifest(current, public_key)
    after = verify_manifest(candidate, public_key)
    require(after["release"] >= before["release"], "Refusing to publish an older release sequence.")
    if after["release"] == before["release"]:
        require(current == candidate, "A published release sequence is immutable.")


def remote_stat(sftp, path):
    try:
        return sftp.lstat(path)
    except OSError as exc:
        if exc.errno == errno.ENOENT:
            return None
        raise


def remote_read(sftp, path, limit):
    details = remote_stat(sftp, path)
    if details is None:
        return None
    require(stat.S_ISREG(details.st_mode), "Remote release entry is not a regular file.")
    require(details.st_size <= limit, "Remote entry exceeds size limit.")
    with sftp.open(path, "rb") as stream:
        raw = stream.read(limit + 1)
    require(len(raw) <= limit, "Remote entry exceeds size limit.")
    return raw


def ensure_directory(sftp, path):
    details = remote_stat(sftp, path)
    if details is None:
        sftp.mkdir(path, mode=0o755)
        details = sftp.lstat(path)
    require(stat.S_ISDIR(details.st_mode), "Remote updates path is not an ordinary directory.")


def upload_staged(sftp, destination, raw, *, replace):
    """Read back before rename; never delete the published target as a fallback."""
    temporary = f"{REMOTE_DIR}/.bridge-stage-{uuid.uuid4().hex}.tmp"
    try:
        with sftp.open(temporary, "wx") as stream:
            stream.set_pipelined(True)
            stream.write(raw)
            stream.flush()
        sftp.chmod(temporary, 0o644)
        require(remote_read(sftp, temporary, len(raw)) == raw, "SFTP upload verification failed.")
        if replace:
            # OpenSSH extension: atomic overwrite. Unsupported servers fail safely.
            sftp.posix_rename(temporary, destination)
        else:
            # Standard SFTP rename must refuse an existing destination.
            sftp.rename(temporary, destination)
        require(remote_read(sftp, destination, len(raw)) == raw, "SFTP destination verification failed.")
    finally:
        if remote_stat(sftp, temporary) is not None:
            sftp.remove(temporary)


def publish_release(sftp, support, public_key, manifest, payload, executable):
    ensure_directory(sftp, "updates")
    ensure_directory(sftp, REMOTE_DIR)
    manifest_path = REMOTE_DIR + "/manifest.json"
    current = remote_read(sftp, manifest_path, MAX_MANIFEST)
    check_progression(current, manifest, public_key)
    key_path = REMOTE_DIR + "/public-key.txt"
    existing_key = remote_read(sftp, key_path, 1024)
    if existing_key is not None:
        require(load_public_key(existing_key) == public_key, "Remote public key differs: a key rotation requires a separate reviewed procedure.")
    # Only these two server support files are published, never a directory mirror.
    for name in (".htaccess", "index.html"):
        raw = read_local(support / name, 16 * 1024)
        target = REMOTE_DIR + "/" + name
        previous = remote_read(sftp, target, 16 * 1024)
        if previous != raw:
            upload_staged(sftp, target, raw, replace=previous is not None)
    if existing_key is None:
        upload_staged(sftp, key_path, base64.b64encode(public_key) + b"\n", replace=False)
    artifact_path = REMOTE_DIR + "/" + payload["url"].removeprefix(BASE_URL)
    existing_exe = remote_read(sftp, artifact_path, MAX_EXE)
    if existing_exe is not None:
        check_executable(existing_exe, payload)
    else:
        upload_staged(sftp, artifact_path, executable, replace=False)
    # The executable is complete and read back before any manifest activation.
    check_executable(remote_read(sftp, artifact_path, MAX_EXE), payload)
    require(remote_read(sftp, manifest_path, MAX_MANIFEST) == current, "Remote manifest changed concurrently; publication stopped.")
    if current != manifest:
        upload_staged(sftp, manifest_path, manifest, replace=current is not None)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, new_url):
        raise PublishError("HTTPS redirects are not allowed for bridge releases.")


def fetch_https(url, limit):
    opener = urllib.request.build_opener(NoRedirect())
    request = urllib.request.Request(url, headers={"Cache-Control": "no-cache", "User-Agent": "SourirePlus-Release-Verification/1"})
    with opener.open(request, timeout=30) as response:
        require(response.status == 200 and response.geturl() == url, "Unexpected HTTPS response.")
        raw = response.read(limit + 1)
    require(len(raw) <= limit, "HTTPS response exceeds size limit.")
    return raw


def verify_live(manifest, payload):
    for attempt in range(5):
        try:
            require(fetch_https(BASE_URL + "manifest.json", MAX_MANIFEST) == manifest, "Live manifest differs from the signed release.")
            check_executable(fetch_https(payload["url"], MAX_EXE), payload)
            return
        except (OSError, PublishError):
            if attempt == 4:
                raise PublishError("Live HTTPS verification failed; inspect this publication before any next release.") from None
            time.sleep(2 * (attempt + 1))


def connect_sftp():
    import paramiko
    host = os.environ.get("SFTP_SERVER", "")
    user = os.environ.get("SFTP_USERNAME", "")
    password = os.environ.get("SFTP_PASSWORD", "")
    port = os.environ.get("SFTP_PORT", "22") or "22"
    require(host and user and password and port.isdigit(), "Missing SFTP repository secrets.")
    require(re.fullmatch(r"[A-Za-z0-9.-]+", host) and 1 <= int(port) <= 65535, "Invalid SFTP connection settings.")
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    # Same unknown-host policy as the site's existing lftp sftp:auto-confirm yes.
    # A known host key mismatch is still rejected; no password is printed.
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port=int(port), username=user, password=password, look_for_keys=False, allow_agent=False, timeout=30, auth_timeout=30, banner_timeout=30)
        sftp = client.open_sftp()
        sftp.get_channel().settimeout(60)
        return client, sftp
    except Exception:
        client.close()
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-dir", type=Path, default=Path("bridge-releases/current"))
    parser.add_argument("--support-dir", type=Path, default=Path("bridge-releases/support"))
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args()
    try:
        public_key, manifest, payload, executable = load_release(args.release_dir)
        print(f"SIGNED_RELEASE_VALID version={payload['version']} release={payload['release']}")
        if args.publish:
            client, sftp = connect_sftp()
            try:
                publish_release(sftp, args.support_dir, public_key, manifest, payload, executable)
            finally:
                sftp.close()
                client.close()
            verify_live(manifest, payload)
            print("BRIDGE_RELEASE_LIVE_OK")
        return 0
    except PublishError as exc:
        print(f"Publication stopped: {exc}", file=sys.stderr)
    except Exception:
        # Connection exceptions can contain infrastructure details: no raw trace.
        print("Publication stopped: file access, SFTP or HTTPS connection failed.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
