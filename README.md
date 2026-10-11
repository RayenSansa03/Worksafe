# WorkSafe Mobile

Application mobile Expo / React Native TypeScript pour le suivi d'entraînement d'une genouillère instrumentée. L'interface et les libellés sont en français.

## Démarrage

1. Installer Node.js et npm, puis lancer `npm install`.
2. Lancer `npx expo start` et ouvrir l'application sur un simulateur ou un appareil.
3. Depuis l'accueil initial, choisissez le mode démonstration sur l'écran de connexion. Les mesures simulées sont explicitement signalées.

Le BLE natif n'est pas actif dans cette version. Expo Go ne fournit pas à lui seul les modules natifs requis. Une intégration matérielle devra utiliser un development build et le protocole de firmware documenté.

## Données et parcours

- Les préférences, seuils, alertes et résumés de séances sont stockés localement avec AsyncStorage.
- Les mesures démo ne sont générées que pendant une séance et lorsque le mode démo a été activé.
- Les seuils modifiables sont des paramètres de suivi, pas des limites médicales.
- Les séances terminées peuvent être exportées en CSV via le partage natif.

## Informations requises pour l'ESP32

Avant d'activer le BLE réel, documenter le service GATT et ses UUID, les caractéristiques de notification et d'écriture, la structure/version et l'endianess des paquets, les unités et horodatages, le compteur d'étapes (delta ou cumul), les conditions de déconnexion, et la réponse confirmant la calibration. La commande de calibration `C` ne doit être envoyée qu'après connexion BLE réelle et action explicite de l'utilisateur. Le service `BleKneeSensorService` échoue de manière explicite tant que ces détails ne sont pas renseignés.

## Vérifications

`npm run typecheck` lance le contrôle TypeScript. Les checks ne peuvent s'exécuter qu'après installation des dépendances Expo compatibles.
