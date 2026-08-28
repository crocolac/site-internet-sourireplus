# Intégration du formulaire avec la borne

## État actuel

- Le parcours « J’ai déjà mon code » ouvre la borne publique MyDentalPass.
- Les nouveaux patients sont temporairement redirigés vers OneDoc.
- Aucun secret ni endpoint administratif de la borne n’est envoyé au navigateur.

## Architecture cible

1. Le formulaire public envoie une demande minimale à un endpoint PHP hébergé sur OVH.
2. Le relais valide les champs, applique une limite de débit et vérifie un anti-robot.
3. Le relais signe la requête côté serveur avec un secret partagé.
4. Une route dédiée dans le dépôt `borne-rdv` crée une demande de rendez-vous ou renvoie des créneaux autorisés.
5. Le patient reçoit une confirmation et, si nécessaire, un code compatible avec le parcours de la borne.

## Conditions avant activation

- créer une route publique dédiée dans `borne-rdv` ; ne pas réutiliser `admin/simple.php` ;
- définir un secret séparé du mot de passe administrateur ;
- ajouter rate limiting, journalisation minimale et protection anti-robot ;
- limiter strictement motifs, praticiens, durées et données retournées ;
- documenter la conservation et la suppression des données de santé ;
- tester le parcours complet sur une URL de préproduction avant le domaine principal.
