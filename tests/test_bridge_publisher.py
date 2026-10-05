import base64
import errno
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "publish_bridge_updates.py"
spec = importlib.util.spec_from_file_location("publisher", SCRIPT)
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class RemoteFile:
    def __init__(self, stream):
        self.stream = stream

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.stream.close()

    def set_pipelined(self, value):
        pass

    def __getattr__(self, key):
        return getattr(self.stream, key)


class LocalSFTP:
    def __init__(self, root):
        self.root = root
        self.events = []

    def lstat(self, path):
        return (self.root / path).lstat()

    def mkdir(self, path, mode):
        (self.root / path).mkdir(mode=mode)

    def open(self, path, mode):
        self.events.append(("open", path, mode))
        return RemoteFile((self.root / path).open("xb" if mode == "wx" else mode))

    def chmod(self, path, mode):
        (self.root / path).chmod(mode)

    def remove(self, path):
        self.events.append(("remove", path))
        (self.root / path).unlink()

    def rename(self, source, target):
        self.events.append(("rename", source, target))
        if (self.root / target).exists():
            raise FileExistsError(target)
        (self.root / source).rename(self.root / target)

    def posix_rename(self, source, target):
        self.events.append(("posix_rename", source, target))
        os.replace(self.root / source, self.root / target)


class PublisherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.key = Ed25519PrivateKey.generate()
        self.public = self.key.public_key().public_bytes_raw()
        self.exe = b"MZ synthetic Windows executable, never executed"
        self.payload = {
            "schema": 1, "product": "sourireplus-bridge", "channel": "stable",
            "release": 2, "version": "0.3.0", "platform": "windows-x64",
            "url": publisher.BASE_URL + "SourirePlusBridge-0.3.0.exe",
            "size": len(self.exe), "sha256": hashlib.sha256(self.exe).hexdigest(),
            "min_launcher": 1,
        }
        self.raw = self.sign(self.payload)
        self.support = SCRIPT.parents[1] / "bridge-releases" / "support"

    def sign(self, payload):
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return json.dumps({"payload": base64.b64encode(raw).decode(), "signature": base64.b64encode(self.key.sign(raw)).decode()}).encode()

    def test_signed_release_validates_and_tampered_executable_fails(self):
        (self.root / "public-key.txt").write_bytes(base64.b64encode(self.public))
        (self.root / "manifest.json").write_bytes(self.raw)
        artifact = self.root / "SourirePlusBridge-0.3.0.exe"
        artifact.write_bytes(self.exe)
        self.assertEqual(publisher.load_release(self.root)[2], self.payload)
        artifact.write_bytes(self.exe + b"changed")
        with self.assertRaises(publisher.PublishError):
            publisher.load_release(self.root)

    def test_signature_and_foreign_url_are_rejected(self):
        other = Ed25519PrivateKey.generate().public_key().public_bytes_raw()
        with self.assertRaises(publisher.PublishError):
            publisher.verify_manifest(self.raw, other)
        payload = dict(self.payload, url="https://example.org/program.exe")
        with self.assertRaises(publisher.PublishError):
            publisher.verify_manifest(self.sign(payload), self.public)

    def test_old_or_modified_same_sequence_refused(self):
        publisher.check_progression(self.raw, self.raw, self.public)
        for payload in (dict(self.payload, release=1), dict(self.payload, min_launcher=2)):
            with self.assertRaises(publisher.PublishError):
                publisher.check_progression(self.raw, self.sign(payload), self.public)

    def test_permission_failure_is_not_treated_as_missing(self):
        class Denied:
            def lstat(self, path):
                raise PermissionError(errno.EACCES, "denied")
        with self.assertRaises(PermissionError):
            publisher.remote_stat(Denied(), "manifest.json")

    def test_publish_then_idempotent_repeat_then_atomic_manifest_update(self):
        remote = LocalSFTP(self.root)
        publisher.publish_release(remote, self.support, self.public, self.raw, self.payload, self.exe)
        renames = [event for event in remote.events if event[0].endswith("rename")]
        self.assertEqual(renames[-1][-1], "updates/bridge/manifest.json")
        exe_name = "updates/bridge/SourirePlusBridge-0.3.0.exe"
        self.assertLess(next(i for i, event in enumerate(renames) if event[-1] == exe_name), len(renames) - 1)
        remote.events.clear()
        publisher.publish_release(remote, self.support, self.public, self.raw, self.payload, self.exe)
        self.assertFalse(any(event[0].endswith("rename") for event in remote.events))
        revised = dict(self.payload, release=3)
        publisher.publish_release(remote, self.support, self.public, self.sign(revised), revised, self.exe)
        self.assertTrue(any(event[0] == "posix_rename" and event[-1] == "updates/bridge/manifest.json" for event in remote.events))
        self.assertFalse(any(event[0] == "remove" and event[1] == "updates/bridge/manifest.json" for event in remote.events))

    def test_existing_different_binary_is_never_overwritten(self):
        remote = LocalSFTP(self.root)
        publisher.publish_release(remote, self.support, self.public, self.raw, self.payload, self.exe)
        path = self.root / "updates/bridge/SourirePlusBridge-0.3.0.exe"
        path.write_bytes(b"MZ different existing program")
        with self.assertRaises(publisher.PublishError):
            publisher.publish_release(remote, self.support, self.public, self.raw, self.payload, self.exe)
        self.assertEqual(path.read_bytes(), b"MZ different existing program")

    def test_failed_atomic_rename_preserves_previous_manifest(self):
        remote = LocalSFTP(self.root)
        publisher.publish_release(remote, self.support, self.public, self.raw, self.payload, self.exe)
        def fail(*args):
            raise OSError("extension unavailable")
        remote.posix_rename = fail
        revised = dict(self.payload, release=3)
        with self.assertRaises(OSError):
            publisher.publish_release(remote, self.support, self.public, self.sign(revised), revised, self.exe)
        self.assertEqual((self.root / "updates/bridge/manifest.json").read_bytes(), self.raw)
        self.assertFalse(list((self.root / "updates/bridge").glob(".bridge-stage-*")))


if __name__ == "__main__":
    unittest.main()
