# Mesure publicitaire interne

Coordonné avec crocolac/borne-rdv, branche feature/chatgpt-ads-statistics-20260924.

Le composant client AdAttribution est monté uniquement sur l'accueil. Il ne démarre la mesure que pour utm_source=chatgpt, utm_medium=cpc et utm_campaign=sourireplus_rdv, après accord. La préférence et le jeton sont conservés 30 minutes dans l'onglet. Le champ ad_attribution est ajouté uniquement à create_request et ne contient pas de données patient. Aucun appel au service publicitaire OpenAI.

Déployer le backend avant le site ; ne modifier l'URL de l'annonce qu'après vérification des deux déploiements. Le code du site seul ne suffit pas. La demande d'intégration du backend a été bloquée par le connecteur lors de cette session : cette branche n'est donc pas présentée comme en production.

URL d'annonce à appliquer après validation : https://sourireplus.ch/?utm_source=chatgpt&utm_medium=cpc&utm_campaign=sourireplus_rdv

Vérifications : refus => aucun appel ads-visit.php ; accord => un seul UUID malgré remontage ou rafraîchissement ; create_request envoie le jeton signé mais manage_link ne l'envoie pas ; délai ou indisponibilité analytics ne bloque pas le formulaire ; aucune donnée clinique dans le suivi. Tester sur environnement isolé sans créer de faux rendez-vous cliniques.

Les coûts réels sont importés dans l'administration de la borne, jamais dans ce dépôt public. La synchronisation automatique des dépenses n'est pas encore raccordée. Ne pas confondre budget de 30 CHF/jour et dépense réalisée.
