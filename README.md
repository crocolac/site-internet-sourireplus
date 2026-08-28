# Site Internet SourirePlus

Refonte non-WordPress de la Clinique Dentaire SourirePlus à Neuchâtel.

## Direction

- identité premium inspirée de la borne SourirePlus : bleu nuit, ivoire et or ;
- emblème historique adapté à la nouvelle charte ;
- parcours de rendez-vous visible dès l’accueil ;
- expertises : maintenance et hygiène, esthétique, endodontie, orthodontie, implantologie ;
- journal pédagogique avec un ton vivant ;
- photos et portraits temporaires, conçus pour être remplacés par les visuels réels.

## Développement

```bash
npm install
npm run dev
```

Le build est entièrement statique et produit le dossier `out/` :

```bash
npm run build
```

## Rendez-vous

Les patients déjà munis d’un code sont dirigés vers la borne MyDentalPass. Les nouveaux patients finalisent temporairement leur demande sur OneDoc. Le branchement direct doit passer par un relais serveur sécurisé, jamais par l’API administrative de la borne exposée dans le navigateur. Voir [docs/borne-integration.md](docs/borne-integration.md).

## Déploiement OVH

Le workflow manuel `Deploy static site to OVH` construit le site puis copie `out/` à la racine SFTP sans suppression distante. Il exige la confirmation `DEPLOY` et ne touche pas au dossier `sourireplus.bak`.
