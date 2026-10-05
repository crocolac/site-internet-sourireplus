# Publications de SourirePlus Bridge

`current/` doit contenir exactement `public-key.txt`, `manifest.json` et l’exécutable versionné référencé par ce manifeste (`SourirePlusBridge-x.y.z.exe`). Aucun document clinique, identifiant patient, secret ni clé privée dans ce dépôt public.

Le manifeste est signé hors du dépôt et d’OVH avec la clé privée Ed25519 du responsable des publications. Le kit Windows épingle la clé publique et l’URL `https://sourireplus.ch/updates/bridge/manifest.json`. Le fichier public-key.txt hébergé sur OVH est informatif ; le lanceur ne lui délègue pas sa confiance.

Une pull request valide la signature, l’URL exacte, la taille et le SHA-256 de l’exécutable, sans secret OVH ni publication. Après fusion dans main, le workflow dédié publie uniquement dans `updates/bridge/`, à la racine SFTP existante. Il ne déclenche pas le déploiement du site et ne modifie pas l’application Méthode.

L’exécutable est envoyé sous un nom temporaire, relu intégralement, puis renommé sans écraser une version existante. Une version existante au même nom doit être strictement identique. Le manifeste signé est publié en dernier, par renommage atomique POSIX SFTP, puis relu. La publication s’arrête si le serveur ne prend pas en charge ce renommage ; aucun effacement préalable du manifeste n’est utilisé. Un contrôle HTTPS vérifie ensuite le manifeste exact et le SHA-256 du programme, sans accepter de redirection.

Le numéro entier `release` doit augmenter à chaque nouvelle publication. Republier exactement les mêmes octets est possible ; modifier une séquence déjà publiée ou publier une séquence plus ancienne est refusé. Le workflow conserve les anciens exécutables OVH et ne fait aucune purge.

Les secrets existants utilisés sont SFTP_SERVER, SFTP_USERNAME, SFTP_PASSWORD et SFTP_PORT. Paramiko applique la même politique de première connexion que le déploiement actuel (`sftp:auto-confirm yes`), et rejette un changement de clé d’hôte déjà connue. Aucun mot de passe n’est passé en ligne de commande ni imprimé. Toute rotation de la clé de signature requiert une procédure distincte et une mise à jour du lanceur/configuration installée.

Vérification locale : `python -m pip install cryptography==50.0.2`, puis `python scripts/publish_bridge_updates.py`. Publication dans CI uniquement : ajouter `--publish` avec Paramiko 5.0.0 et les secrets SFTP.
