# Intégration firmware ↔ application (WorkSafe)

Source analysée : https://github.com/tayaria/WorkSafe (commit `6aa8918`, `edge-ai/worksafe_v2/worksafe_v2.ino`).

## Ce que le firmware envoie réellement

- Nom BLE : `WorkSafe`. Il annonce le service Nordic UART `6E400001-…` (l'appli filtre dessus).
- Une notification par seconde sur TX `6E400003-…`, une seule ligne ASCII, sans retour à la ligne :

```
K:42.5,V:310,P:4.2,S:120,C:85,T:31.4,D:1.2,N:1,F:009
```

| Champ | Sens | Remarque |
|---|---|---|
| K | angle du genou (°) | en mode 1 capteur : **inclinaison du tibia** |
| V | vitesse angulaire (°/s) | |
| P | dernier pic de choc (g) | |
| S | foulées depuis la calibration | |
| C | cadence (foulées/min) | **jambe équipée seulement** : ≈ 85 en course à 170 pas/min |
| T / D | température / écart à la calibration (°C) | |
| N | niveau d'alerte 0/1/2 | |
| F | indicateurs déclenchés | **3 chiffres hexadécimaux**, bit i = indicateur i (voir `src/constants/flags.ts`) |
| B | tension batterie (V) | seulement si `USE_BATT_SENSE 1` |
| A, Y, Z, I | IA (score, classe, fusion, temps d'inférence en ms) | **seulement si `AI_PRINT_BLE 1`** ; `A:-,Y:-,Z:-,I:-` avant la première inférence |

- Commandes sur RX `6E400002-…` : `C` lance la calibration (~2,2 s, la carte ne mesure pas pendant ce temps) ; **`M` bascule** le mute du buzzer (`mute = !mute`), ce n'est pas « couper » mais « inverser ».

## Réglages à faire sur la carte pour l'application

1. `#define AI_PRINT_BLE 1` pour afficher les valeurs IA dans l'appli (sinon la section « IA expérimentale » indique qu'elles ne sont pas transmises).
2. `#define USE_BATT_SENSE 1` si le diviseur 100k/100k est câblé sur GPIO35 (affiche la batterie).

## Correctif appliqué dans ce projet (`edge-ai/worksafe_v2/worksafe_v2.ino`) : signaler le mode 1 capteur et l'état du mute

Le firmware ne dit pas à l'application que le capteur de cuisse est absent, ni si le buzzer est coupé. L'application sait lire deux champs optionnels :
`X:1` (capteur cuisse absent) et `U:1` (buzzer coupé). Dans `loop()`, après la construction de `buf` :

```cpp
n += snprintf(buf + n, sizeof(buf) - n, ",X:%d,U:%d", thigh.ok ? 0 : 1, mute ? 1 : 0);
```

(à placer juste avant le bloc `#if !LOG_CSV`, et passer `char buf[140]` à `char buf[160]`). Sans ce correctif, l'application fonctionne mais n'affiche pas le badge « Mode 1 capteur » et suppose que le buzzer est actif à chaque connexion.

## Points à vérifier sur le matériel

- Android demande le MTU 185 à la connexion ; iOS le négocie seul. Sans cela une trame de ~80 octets serait tronquée à 20.
- Si le buzzer est resté coupé lors d'une session précédente, l'état supposé par l'appli (actif) sera faux tant que le patch `U` n'est pas appliqué.
- Longueur de foulée pour les calories : une « foulée » du firmware est un appui de la jambe équipée (≈ 2 pas). Réglez-la autour de 2 m dans Réglages.
