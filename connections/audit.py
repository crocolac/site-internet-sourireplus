"""Read-only SFTP connection check. Never reads configuration or patient data."""
import base64,io,os,ftplib
import paramiko
HOSTS={'ftp.cluster031.hosting.ovh.net','ftp.cluster131.hosting.ovh.net','ssh.cluster031.hosting.ovh.net','ssh.cluster131.hosting.ovh.net'}
host=os.environ['CONNECTION_HOST']
if host not in HOSTS:raise SystemExit('Unexpected hosting server')
if os.environ.get('CONNECTION_PROTOCOL')=='ftp':
 ftp=ftplib.FTP();ftp.connect(host,int(os.environ.get('CONNECTION_PORT','21') or '21'),timeout=30)
 ftp.login(os.environ['CONNECTION_USERNAME'],os.environ['CONNECTION_PASSWORD'])
 root=os.environ.get('CONNECTION_ROOT','.') or '.';ftp.cwd(root)
 for marker in os.environ['CONNECTION_MARKERS'].split(','):
  if not marker or marker.startswith('/') or '..' in marker.split('/'):raise SystemExit('Unsafe marker')
  if not ftp.nlst(marker):raise SystemExit('Expected marker is absent')
 print('CONNECTION_OK: existing FTP connection and expected site files verified without remote writes.')
 ftp.quit();raise SystemExit(0)
# The hosting was migrated to cluster131; use its verified canonical SSH endpoint.
host='ssh.cluster131.hosting.ovh.net'
client=paramiko.SSHClient()
client.load_host_keys('connections/ovh_known_hosts')
client.set_missing_host_key_policy(paramiko.RejectPolicy())
kwargs={'hostname':host,'username':os.environ['CONNECTION_USERNAME'],'port':22,'allow_agent':False,'look_for_keys':False,'timeout':30,'auth_timeout':30}
if os.environ.get('CONNECTION_KEY_B64'):
 key=io.StringIO(base64.b64decode(os.environ['CONNECTION_KEY_B64']).decode())
 try:kwargs['pkey']=paramiko.Ed25519Key.from_private_key(key)
 except paramiko.SSHException:
  key.seek(0);kwargs['pkey']=paramiko.RSAKey.from_private_key(key)
else:kwargs['password']=os.environ['CONNECTION_PASSWORD']
client.connect(**kwargs)
try:
 sftp=client.open_sftp()
 root=os.environ.get('CONNECTION_ROOT','.') or '.'
 sftp.chdir(root)
 markers=os.environ['CONNECTION_MARKERS'].split(',')
 for marker in markers:
  if not marker or marker.startswith('/') or '..' in marker.split('/'):raise SystemExit('Unsafe marker')
  sftp.stat(marker)
 print('CONNECTION_OK: expected site files are present; no remote writes were performed.')
 sftp.close()
finally:client.close()
