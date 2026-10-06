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
import sys
import tempfile
import urllib.error
import urllib.request
import uuid
import zipfile
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

import publish_bridge_updates as updates

BASE="https://sourireplus.ch/methode/visite/"
FILES=(".htaccess","lib.php","api.php","team.js","index.html")


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
    config_path=private+"/config.json";access_path=private+"/installation-access.json"
    raw=updates.remote_read(sftp,config_path,4096)
    access_raw=updates.remote_read(sftp,access_path,4096)
    if raw is None:
        updates.require(access_raw is None,"An unfinished access configuration exists.")
        access={"staff_key":secrets.token_urlsafe(32),"bridge_key":secrets.token_urlsafe(32)}
        config={"key":base64.b64encode(os.urandom(32)).decode(),
                "access_hash":hashlib.sha256(access["staff_key"].encode()).hexdigest(),
                "bridge_hash":hashlib.sha256(access["bridge_key"].encode()).hexdigest()}
        put(sftp,access_path,json.dumps(access).encode())
        put(sftp,config_path,json.dumps(config).encode())
    else:
        updates.require(access_raw is not None,"Private installation access missing. Do not replace an existing encryption key.")
        config=json.loads(raw);access=json.loads(access_raw)
        updates.require(len(base64.b64decode(config["key"]))==32,"Invalid stored encryption key.")
        for value,field in [("staff_key","access_hash"),("bridge_key","bridge_hash")]:
            updates.require(hashlib.sha256(access[value].encode()).hexdigest()==config[field],"Private access configuration differs.")
    return access


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
        "METHODE SOURIREPLUS 0.4.0 - KIT PRIVE DU TECHNICIEN\n\n"
        "Lire docs/INSTALLATION-METHODE-WEB.md.\n"
        "Installer sur le veritable hote d'execution ZaWin.\n"
        "Le programme VDDS est SourirePlusLauncher.exe.\n"
        "La configuration web et les mises a jour sont preconfigurees.\n"
        "La cle de liaison est privee : ne pas publier ce kit.\n"
        "3Shape/Dx Plus et retour PDF ZaWin ne sont pas encore actifs.\n")
    sums=[]
    for file in sorted(staged.rglob("*")):
        if file.is_file() and file.name!="SHA256SUMS.txt":
            sums.append(hashlib.sha256(file.read_bytes()).hexdigest()+"  "+file.relative_to(staged).as_posix())
    (staged/"SHA256SUMS.txt").write_text("\n".join(sums)+"\n")
    with zipfile.ZipFile(output/"SourirePlus-Methode-OVH-Windows-0.4.0.zip","w",zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(staged.rglob("*")):
            if file.is_file():archive.write(file,file.relative_to(staged).as_posix())
    (output/"Acces-equipe-Methode-SourirePlus.txt").write_text(
        "ACCES PRIVE DE L'EQUIPE - METHODE SOURIREPLUS\n\n"+BASE+"\n\nCode de la clinique :\n"+
        access["staff_key"]+"\n\nConserver ce fichier avec les acces internes. Ne pas publier ni partager avec les patients.\n"
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
    code,status=api("status");updates.require(code==200 and status.get("version")=="0.4.0","Live service version differs.")
    updates.require(api("sessions")[0]==401,"Sessions must require authentication.")
    for name in FILES:
        if name in ("lib.php",".htaccess"):continue
        if name=="api.php":continue
        updates.require(updates.fetch_https(BASE+name,1024*1024)==(Path("public/methode/visite")/name).read_bytes(),"Live page differs from release.")
    patient={"patient_id":"INSTALLATION-"+uuid.uuid4().hex,"display_id":"TEST INSTALLATION","first_name":"Validation","last_name":"Technique","birth_date":"2000-01-01","source_pvs":"TEST_INSTALLATION","practice_number":"TEST"}
    code,result=api("create",{"patient":patient,"resume_today":False},access["bridge_key"])
    updates.require(code==201,"Hosted identity reception failed.")
    sid=result["session_id"]
    try:
        token=parse_qs(urlsplit(result["links"]["presentation"]).fragment)["token"][0]
        code,state=api("state",key=token,session=sid)
        updates.require(code==200 and state.get("dossier")=="TEST INSTALLATION" and "links" not in state and "plan" not in state,"Private role filtering failed.")
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
    if not args.publish:print("METHOD_RELEASE_VALID");return
    client,sftp=updates.connect_sftp();previous={};written=[]
    try:
        root=sftp.normalize(".");updates.require(root!="/","SFTP root must expose the hosting parent for private storage.")
        private=posixpath.dirname(root)+"/.sourireplus-methode"
        access=configuration(sftp,private)
        encrypted_delivery(args.kit,access,public_bytes)
        directory(sftp,private+"/backups",0o700)
        directory(sftp,"methode",0o755);directory(sftp,"methode/visite",0o755)
        for name in FILES:
            target="methode/visite/"+name
            previous[name]=updates.remote_read(sftp,target,1024*1024)
            if previous[name] is not None:
                backup=private+"/backups/"+name.replace('.','_')+"-"+hashlib.sha256(previous[name]).hexdigest()
                if updates.remote_stat(sftp,backup) is None:put(sftp,backup,previous[name])
            put(sftp,target,(Path("public/methode/visite")/name).read_bytes(),0o644);written.append(name)
        try:smoke(sftp,private,access)
        except Exception:
            for name in reversed(written):
                target="methode/visite/"+name
                if previous[name] is None:sftp.remove(target)
                else:put(sftp,target,previous[name],0o644)
            raise
        updates.publish_release(sftp,Path("bridge-releases/support"),public,envelope,payload,exe)
    finally:sftp.close();client.close()
    updates.verify_live(envelope,payload)
    print("METHOD_AND_WINDOWS_LIVE_OK version=0.4.0")


if __name__=="__main__":
    try:main()
    except Exception:
        # Never include access keys, patient content, hosting paths or raw HTTP responses.
        print("Method publication failed. Inspect the validation step and restore status before retrying.",file=sys.stderr)
        sys.exit(1)
