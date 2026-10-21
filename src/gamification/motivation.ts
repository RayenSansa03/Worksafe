/**
 * Motivational copy. Wording stays factual and encouraging; it never claims
 * to prevent injuries or to give health advice.
 */

export type HomeContext = {
  hour: number;
  streakDays: number;
  sessionsThisWeek: number;
  weeklyGoal: number;
  totalSessions: number;
};

export function greeting(hour: number): string {
  if (hour < 5) return 'Bonne nuit';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function motivationFor(c: HomeContext): { title: string; body: string } {
  if (c.totalSessions === 0) {
    return { title: 'Votre première séance vous attend', body: 'Branchez la genouillère ou lancez la démo pour voir vos premières mesures.' };
  }
  if (c.sessionsThisWeek >= c.weeklyGoal) {
    return { title: 'Objectif de la semaine atteint', body: `${c.sessionsThisWeek} séances cette semaine : belle régularité.` };
  }
  if (c.streakDays >= 2) {
    return { title: `${c.streakDays} jours d’affilée`, body: 'Continuez sur cette lancée, une séance de plus prolonge votre série.' };
  }
  const left = c.weeklyGoal - c.sessionsThisWeek;
  return { title: `Encore ${left} séance${left > 1 ? 's' : ''} cette semaine`, body: 'Une séance courte compte aussi pour votre objectif.' };
}

export const TIPS = [
  'Un échauffement progressif rend le début de séance plus confortable.',
  'Calibrez à chaque séance : jambe tendue et immobile pendant 2 secondes.',
  'Gardez les deux capteurs alignés pour des mesures cohérentes d’une séance à l’autre.',
  'Les valeurs d’IA sont expérimentales : regardez-les comme de la curiosité, pas comme un conseil.',
  'La régularité de cadence est un indicateur de la séance, pas un diagnostic.',
];

/** Stable tip of the day. */
export function tipOfTheDay(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return TIPS[day % TIPS.length];
}

export function sessionPraise(regularity: number | null, durationS: number): string {
  if (durationS < 120) return 'Séance courte enregistrée.';
  if (regularity !== null && regularity >= 85) return 'Cadence très régulière, bravo.';
  if (durationS >= 1800) return 'Belle séance longue.';
  return 'Bien joué, séance terminée.';
}
