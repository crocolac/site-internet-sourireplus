"""Publish only the Method and its exact signed Windows kit on existing OVH hosting."""
from __future__ import annotations
import argparse
import base64
import hashlib
import io
import json
import os
from pathlib import Path
import posixpath
import secrets
import shutil
import stat
import subprocess
import sys
import tempfile
import traceback
import urllib.error
import urllib.request
import uuid
import zipfile
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

import publish_bridge_updates as updates

BASE="https://sourireplus.ch/methode/visite/"
FILES=(".htaccess","lib.php","api.php","team.js","pdf-lib.1.17.1.min.js","pdf-lib.LICENSE.txt","report-pdf.js","index.html")

def release_files(release):
    version=release.get("web_version", "0.4.0")
    updates.require(isinstance(version,str) and updates.VERSION.fullmatch(version), "Invalid web version.")
    parts=tuple(map(int,version.split('.')))
    paths=["visite/"+name for name in FILES]
    if parts >= (0,5,0):
        paths += ["visite/3shape.php", "api/3shape/oauth/.htaccess", "api/3shape/oauth/callback.php"]
    if parts >= (0,6,0):
        paths += ["visite/3shape-bridge.php", "visite/3shape-ui.js"]
    return tuple(paths)


def validate_web_snapshot(root,source,release):
    for name in release_files(release):
        deployed=root/name; original=source/name
        updates.require(deployed.is_file() and original.is_file() and deployed.read_bytes()==original.read_bytes(),
                        "Published Method file missing or different from the source snapshot.")


GUARD=b"<?php http_response_code(404); exit; __halt_compiler();\n"


def put(sftp,path,raw,mode=0o600):
    temp=path+"."+uuid.uuid4().hex+".tmp"
    try:
        with sftp.open(temp,"wx") as stream:
            stream.write(raw);stream.flush()
        sftp.chmod(temp,mode)
        updates.require(updates.remote_read(sftp,temp,len(raw))==raw,"Upload verification failed.")
        if updates.remote_stat(sftp,path) is None:sftp.rename(temp,path)
        else:sftp.posix_rename(temp,path)
    finally:
        if updates.remote_stat(sftp,temp) is not None:sftp.remove(temp)


def directory(sftp,path,mode):
    if updates.remote_stat(sftp,path) is None:sftp.mkdir(path,mode=mode)
    updates.require(stat.S_ISDIR(sftp.lstat(path).st_mode),"Expected ordinary directory.")
    sftp.chmod(path,mode)


def configuration(sftp,private):
    directory(sftp,private,0o700)
    config_path=private+"/config.php";access_path=private+"/installation-access.php"
    raw=updates.remote_read(sftp,config_path,4096)
    access_raw=updates.remote_read(sftp,access_path,4096)
    if raw is None:
        updates.require(access_raw is None,"An unfinished access configuration exists.")
        access={"staff_key":secrets.token_urlsafe(32),"bridge_key":secrets.token_urlsafe(32)}
        config={"key":base64.b64encode(os.urandom(32)).decode(),
                "access_hash":hashlib.sha256(access["staff_key"].encode()).hexdigest(),
                "bridge_hash":hashlib.sha256(access["bridge_key"].encode()).hexdigest()}
        put(sftp,access_path,GUARD+json.dumps(access).encode())
        put(sftp,config_path,GUARD+json.dumps(config).encode())
    else:
        updates.require(access_raw is not None,"Private installation access missing. Do not replace an existing encryption key.")
        updates.require(raw.startswith(GUARD) and access_raw.startswith(GUARD),"Private configuration guard missing.")
        config=json.loads(raw[len(GUARD):]);access=json.loads(access_raw[len(GUARD):])
        updates.require(len(base64.b64decode(config["key"]))==32,"Invalid stored encryption key.")
        for value,field in [("staff_key","access_hash"),("bridge_key","bridge_hash")]:
            updates.require(hashlib.sha256(access[value].encode()).hexdigest()==config[field],"Private access configuration differs.")
    access["_staff_password_managed"] = "staff_password_hash" in config
    return access


def apply_staff_password(sftp,private,access):
    password=os.environ.get("METHOD_STAFF_PASSWORD", "")
    if not password:return
    updates.require(10 <= len(password.encode()) <= 72 and password==password.strip(), "Invalid team password length or whitespace.")
    path=private+"/config.php"
    raw=updates.remote_read(sftp,path,4096)
    updates.require(raw is not None and raw.startswith(GUARD),"Private configuration missing.")
    config=json.loads(raw[len(GUARD):])
    # PHP receives the password through stdin, never a command-line argument.
    # Keep the same hash when re-publishing the same password (preserves cookies).
    program='$v=json_decode(stream_get_contents(STDIN),true); echo isset($v["hash"]) && password_verify($v["password"],$v["hash"]) ? $v["hash"] : password_hash($v["password"],PASSWORD_BCRYPT,["cost"=>12]);'
    hashed=subprocess.run(["php","-r",program],input=json.dumps({"password":password,"hash":config.get("staff_password_hash")}),text=True,capture_output=True,check=True).stdout.strip()
    updates.require(hashed.startswith("$2y$12$") and len(hashed)==60,"Password hashing failed.")
    config["staff_password_hash"]=hashed
    updated=GUARD+json.dumps(config).encode()
    if updated!=raw:put(sftp,path,updated)
    access["_staff_password_managed"]=True


def protect_private_directory(sftp,private):
    # Shared OVH credentials can write the site but cannot create a sibling.
    # Deny HTTP access before creating any secret; PHP wrappers add a second barrier.
    directory(sftp,private,0o700)
    put(sftp,private+"/.htaccess",b"Options -Indexes\nRequire all denied\n",0o644)
    probe="access-check-"+uuid.uuid4().hex+".txt"
    put(sftp,private+"/"+probe,b"non-sensitive deployment probe\n",0o644)
    try:
        opener=urllib.request.build_opener(updates.NoRedirect())
        for name in (probe,"config.php","installation-access.php"):
            request=urllib.request.Request("https://sourireplus.ch/.sourireplus-methode/"+name,headers={"Cache-Control":"no-cache"})
            try:response=opener.open(request,timeout=25)
            except urllib.error.HTTPError as exc:response=exc
            with response:updates.require(response.status==403,"Private directory must deny all HTTP requests before credentials are stored.")
    finally:sftp.remove(private+"/"+probe)
    print("PRIVATE_DIRECTORY_HTTP_DENIED")


def delivery(kit,access,public_key,output):
    output.mkdir(parents=True,exist_ok=True)
    staged=output/"kit-technicien";shutil.copytree(kit,staged,dirs_exist_ok=True)
    (staged/"bridge-web.json").write_text(json.dumps({"schema":1,"api_url":BASE+"api.php","access_key":access["bridge_key"]},indent=2))
    (staged/"bridge-update-public-key.txt").write_bytes(public_key)
    install=json.loads((staged/"bridge-install.json").read_text(encoding="utf-8-sig"))
    install["manifest_url"]="https://sourireplus.ch/updates/bridge/manifest.json"
    install["public_key"]=public_key.decode().strip()
    (staged/"bridge-install.json").write_text(json.dumps(install,indent=2))
    (staged/"COMMENCER-ICI.txt").write_text(
        f"METHODE SOURIREPLUS {install['seed']['version']} - KIT PRIVE DU TECHNICIEN\n\n"
        "Lire docs/INSTALLATION-METHODE-WEB.md.\n"
        "Installer sur le veritable hote d'execution ZaWin.\n"
        "Le programme VDDS est SourirePlusLauncher.exe.\n"
        "La configuration web et les mises a jour sont preconfigurees.\n"
        "La cle de liaison est privee : ne pas publier ce kit.\n"
        "Lire les criteres de recette avant activation clinique.\n"
        "Appairer 3Shape et verifier Unite si cette version inclut la liaison.\n")
    sums=[]
    for file in sorted(staged.rglob("*")):
        if file.is_file() and file.name!="SHA256SUMS.txt":
            sums.append(hashlib.sha256(file.read_bytes()).hexdigest()+"  "+file.relative_to(staged).as_posix())
    (staged/"SHA256SUMS.txt").write_text("\n".join(sums)+"\n")
    with zipfile.ZipFile(output/f"SourirePlus-Methode-OVH-Windows-{install['seed']['version']}.zip","w",zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(staged.rglob("*")):
            if file.is_file():archive.write(file,file.relative_to(staged).as_posix())
    (output/"Acces-equipe-Methode-SourirePlus.txt").write_text(
        "ACCES PRIVE DE L'EQUIPE - METHODE SOURIREPLUS\n\n"+BASE+"\n\nCode de la clinique :\n"+
        ("Mot de passe choisi par la clinique (secret METHOD_STAFF_PASSWORD)." if access.get("_staff_password_managed") else access["staff_key"])+"\n\nConserver ce fichier avec les acces internes. Ne pas publier ni partager avec les patients.\n"
        "Le technicien recoit uniquement le ZIP Windows, qui contient une cle de liaison distincte.\n"
        "Depuis l'espace equipe : creer ou reprendre la seance, ouvrir les deux ecrans.\n"
        "Le lien de presentation peut etre copie sur l'ordinateur tactile. Les liens expirent apres 12 heures.\n"
        "Pour reprendre une seance, ouvrir l'espace equipe : de nouveaux liens sont crees.\n")
    shutil.rmtree(staged)


def encrypted_delivery(kit,access,public_key):
    # The hosting repository is public. Never upload clear-text credentials or
    # a configured private kit as a GitHub Actions artifact.
    with tempfile.TemporaryDirectory(prefix="sp-private-delivery-") as temp:
        directory=Path(temp);delivery(kit,access,public_key,directory)
        data=io.BytesIO()
        with zipfile.ZipFile(data,"w",zipfile.ZIP_STORED) as archive:
            for file in sorted(directory.iterdir()):archive.write(file,file.name)
        key=AESGCM.generate_key(bit_length=256);nonce=os.urandom(12)
        recipient=serialization.load_pem_public_key(Path("methode-release/delivery-public-key.pem").read_bytes())
        wrapped=recipient.encrypt(key,padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),algorithm=hashes.SHA256(),label=None))
        header=json.dumps({"schema":1,"wrapped_key":base64.b64encode(wrapped).decode(),"nonce":base64.b64encode(nonce).decode()},separators=(',',':')).encode()
        sealed=AESGCM(key).encrypt(nonce,data.getvalue(),header)
        Path("delivery-encrypted").mkdir(exist_ok=True)
        Path("delivery-encrypted/methode-delivery.enc").write_bytes(b"SPDELIVERY1\n"+header+b"\n"+sealed)


def api(action,data=None,key=None,session=None):
    headers={"Accept":"application/json"}
    if data is not None:headers["Content-Type"]="application/json"
    if key:headers["X-SourirePlus-Token"]=key
    if session:headers["X-SourirePlus-Session"]=session
    req=urllib.request.Request(BASE+"api.php?action="+action,headers=headers,data=json.dumps(data).encode() if data is not None else None)
    opener=urllib.request.build_opener(updates.NoRedirect())
    try:response=opener.open(req,timeout=25)
    except urllib.error.HTTPError as exc:response=exc
    with response:return response.status,json.loads(response.read(65536))


def smoke(sftp,private,access):
    from urllib.parse import urlsplit,parse_qs
    code,status=api("status");updates.require(code==200 and status.get("version")==json.loads(Path("methode-release/release.json").read_text()).get("web_version","0.4.0"),"Live service version differs.")
    updates.require(api("sessions")[0]==401,"Sessions must require authentication.")
    release=json.loads(Path("methode-release/release.json").read_text())
    paths=release_files(release)
    for name in paths:
        if name.endswith((".php", ".htaccess")):continue
        updates.require(updates.fetch_https("https://sourireplus.ch/methode/"+name,1024*1024)==(Path("public/methode")/name).read_bytes(),"Live page differs from release.")
    opener=urllib.request.build_opener(updates.NoRedirect())
    checks=[("visite/lib.php",403)]
    if "visite/3shape.php" in paths:
        checks += [("visite/3shape.php",403),("api/3shape/oauth/callback",400)]
    if "visite/3shape-bridge.php" in paths:checks.append(("visite/3shape-bridge.php",403))
    for name,expected in checks:
        try:response=opener.open("https://sourireplus.ch/methode/"+name,timeout=25)
        except urllib.error.HTTPError as exc:response=exc
        with response:updates.require(response.status==expected,"Method route protection or OAuth callback differs.")
    patient={"patient_id":"INSTALLATION-"+uuid.uuid4().hex,"display_id":"TEST INSTALLATION","first_name":"Validation","last_name":"Technique","birth_date":"2000-01-01","source_pvs":"TEST_INSTALLATION","practice_number":"TEST"}
    code,result=api("create",{"patient":patient,"resume_today":False},access["bridge_key"])
    updates.require(code==201,"Hosted identity reception failed.")
    sid=result["session_id"]
    try:
        token=parse_qs(urlsplit(result["links"]["presentation"]).fragment)["token"][0]
        code,state=api("state",key=token,session=sid)
        updates.require(code==200 and state.get("dossier")=="TEST INSTALLATION" and "links" not in state and "plan" not in state,"Private role filtering failed.")
        code,reference=api("reference",key=token,session=sid)
        updates.require(code==200 and reference.get("schema")=="sourire-plus-fond-trajectoire" and len(reference.get("series",[]))==6,"Live reference curves are unavailable.")
    finally:
        # Only the exact synthetic session created by this deployment is removed.
        for suffix in (".enc",".lock"):
            path=private+"/"+sid+suffix
            if updates.remote_stat(sftp,path) is not None:sftp.remove(path)


def main():
    parser=argparse.ArgumentParser();parser.add_argument("--kit",type=Path,required=True);parser.add_argument("--publish",action="store_true");args=parser.parse_args()
    release=json.loads(Path("methode-release/release.json").read_text())
    envelope=Path("methode-release/manifest.json").read_bytes()
    public_bytes=Path("bridge-releases/current/public-key.txt").read_bytes()
    public=updates.load_public_key(public_bytes);payload=updates.verify_manifest(envelope,public)
    exe=(args.kit/"seed/SourirePlusBridge.exe").read_bytes();updates.check_executable(exe,payload)
    updates.require(hashlib.sha256(Path("methode-release/source.zip.b64").read_bytes()).hexdigest()==release["source_sha256"],"Source bundle differs from the validated build.")
    files=release_files(release)
    for name in files:updates.require((Path("public/methode")/name).is_file(),"Method release file missing.")
    if not args.publish:print("METHOD_RELEASE_VALID");return
    client,sftp=updates.connect_sftp();previous={};written=[]
    try:
        root=sftp.normalize(".")
        private=posixpath.join(root,".sourireplus-methode")
        protect_private_directory(sftp,private)
        access=configuration(sftp,private)
        previous_config=updates.remote_read(sftp,private+"/config.php",4096)
        directory(sftp,private+"/backups",0o700)
        directory(sftp,"methode",0o755);directory(sftp,"methode/visite",0o755)
        try:
            for name in files:
                target="methode/"+name
                parent="methode"
                for part in name.split('/')[:-1]:
                    parent+="/"+part;directory(sftp,parent,0o755)
                previous[name]=updates.remote_read(sftp,target,1024*1024)
                if previous[name] is not None:
                    backup=private+"/backups/"+name.replace('/','_').replace('.','_')+"-"+hashlib.sha256(previous[name]).hexdigest()
                    if updates.remote_stat(sftp,backup) is None:put(sftp,backup,previous[name])
                put(sftp,target,(Path("public/methode")/name).read_bytes(),0o644);written.append(name)
            apply_staff_password(sftp,private,access)
            smoke(sftp,private,access)
            if os.environ.get("METHOD_STAFF_PASSWORD"):
                updates.require(api("login",{"key":os.environ["METHOD_STAFF_PASSWORD"]})[0]==200,"New team password login failed.")
                updates.require(api("staff",key=access["staff_key"])[0]==401,"Old team key is still accepted.")
                print("TEAM_PASSWORD_LOGIN_VERIFIED_OLD_KEY_REJECTED")
            encrypted_delivery(args.kit,access,public_bytes)
        except Exception:
            put(sftp,private+"/config.php",previous_config)
            for name in reversed(written):
                target="methode/"+name
                if previous[name] is None:sftp.remove(target)
                else:put(sftp,target,previous[name],0o644)
            raise
        updates.publish_release(sftp,Path("bridge-releases/support"),public,envelope,payload,exe)
    finally:sftp.close();client.close()
    updates.verify_live(envelope,payload)
    print("METHOD_AND_WINDOWS_LIVE_OK web="+release.get("web_version","0.4.0")+" bridge="+release["version"])


if __name__=="__main__":
    try:main()
    except Exception as exc:
        # Report code locations only: no credentials, server paths, responses or exception text.
        frames=[f"{Path(frame.filename).name}:{frame.lineno}:{frame.name}" for frame in traceback.extract_tb(exc.__traceback__) if Path(frame.filename).name in {"publish_methode.py","publish_bridge_updates.py"}]
        print("Method publication failed:",type(exc).__name__,"errno="+str(getattr(exc,"errno",None))," > ".join(frames),file=sys.stderr)
        sys.exit(1)


