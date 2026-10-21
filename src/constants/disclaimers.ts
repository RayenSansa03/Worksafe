/**
 * Mandatory notices. Single source of truth: shown in the onboarding and in
 * Settings > About. Wording must never promise injury prevention.
 */
export const DISCLAIMERS = [
  {
    id: 'prototype',
    title: 'Prototype expérimental',
    body: "WorkSafe est un prototype étudiant. Il n'a pas été évalué comme un produit fini.",
  },
  {
    id: 'not-medical',
    title: 'Pas un dispositif médical',
    body: "WorkSafe ne pose aucun diagnostic et ne remplace pas l'avis d'un professionnel de santé.",
  },
  {
    id: 'thresholds',
    title: 'Seuils non validés cliniquement',
    body: "Les seuils d'alerte sont des points de départ techniques. Ils n'ont pas été validés cliniquement.",
  },
  {
    id: 'ai',
    title: 'IA en observation seulement',
    body: "L'analyse par intelligence artificielle est expérimentale. Elle n'influence ni les alertes ni le buzzer.",
  },
] as const;

/** No frame for longer than this => data is considered stale. */
export const STALE_AFTER_MS = 3000;
/** Time window shown by the live chart. */
export const CHART_WINDOW_MS = 60_000;
