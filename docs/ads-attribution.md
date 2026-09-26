# Mesure interne des visites et rendez-vous

Coordonné avec `crocolac/borne-rdv`, PR 55, et la page privée `/borne/admin/statistiques-publicite.php`.

`SiteAcquisition` est monté une fois dans `app/layout.tsx`, sur toutes les pages Next du site. L'ancien composant `AdAttribution` reste un composant vide pour préserver l'import de l'accueil. Le moteur `acquisition-client.ts` gère le choix facultatif, l'expiration 30 minutes, le canal et les premiers clics. Aucun appel de mesure avant accord ; refus ou panne ne bloquent pas la réservation.

Canal publicitaire uniquement pour `utm_source=chatgpt`, `utm_medium=cpc`, `utm_campaign=sourireplus_rdv`. Les autres sessions consenties sont `other_site`, y compris les liens organiques ChatGPT. Le premier canal est conservé pendant la session. Les refus et échecs de collecte ne deviennent pas artificiellement des visites mesurées.

`ads-visit.php` reçoit exclusivement soit `{action:visit,consent:true,campaign,channel,id}`, soit `{action:attempt,consent:true,campaign,attribution:{id,signature}}`. Aucun nom, téléphone, champ de formulaire, motif, URL consultée ou referrer n'est envoyé. Le premier clic concerne les boutons de réservation et les liens vers `/#rendez-vous`, avec déduplication client et serveur. Aucune confirmation n'est fabriquée dans le navigateur.

Le champ `ad_attribution` est envoyé uniquement par `create_request` à l'API interne existante ; `manage_link` n'est pas modifié. La confirmation est comptée par la borne, à sa date effective, une seule fois malgré les reports ; les annulations sont séparées. L'origine reste rattachée après ouverture du SMS sur un autre appareil.

## Déploiement

1. Valider et déployer la borne.
2. Valider et déployer le site.
3. Vérifier les pages, le précontrôle CORS et l'accès privé, sans créer de faux rendez-vous cliniques.
4. Vérifier séparément que l'annonce utilise `https://sourireplus.ch/?utm_source=chatgpt&utm_medium=cpc&utm_campaign=sourireplus_rdv` ; le code du site ne change pas lui-même l'annonce ou le budget.

La CI exécute 12 tests du client (réseau et stockage simulés), construit le site et vérifie les fichiers exportés. Les tests HTTP et MySQL sont dans la borne. Les coûts réels sont importés par CSV dans l'administration privée ; la synchronisation automatique Ads Manager reste à raccorder. Le budget de référence de 30 CHF/jour n'est jamais assimilé à une dépense.
