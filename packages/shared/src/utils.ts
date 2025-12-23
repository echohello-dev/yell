// Word pairs for memorable join codes
const ADJECTIVES = [
  'happy', 'clever', 'bright', 'swift', 'brave', 'calm', 'cool', 'wise',
  'bold', 'keen', 'warm', 'fresh', 'kind', 'quick', 'noble', 'sharp',
  'great', 'strong', 'proud', 'gentle', 'wild', 'free', 'pure', 'true'
];

const NOUNS = [
  'tiger', 'eagle', 'lion', 'bear', 'wolf', 'hawk', 'fox', 'dragon',
  'panda', 'otter', 'dolphin', 'falcon', 'cobra', 'phoenix', 'raven', 'lynx',
  'shark', 'rhino', 'bison', 'moose', 'leopard', 'jaguar', 'cougar', 'viper'
];

/**
 * Generate a memorable join code using word pairs (e.g., "happy-tiger")
 */
export function generateJoinCode(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective}-${noun}`;
}

/**
 * Validate a join code format (word-pair format)
 */
export function isValidJoinCode(code: string): boolean {
  return /^[a-z]+-[a-z]+$/.test(code);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calculate score based on answer correctness and time taken
 * @param isCorrect Whether the answer is correct
 * @param timeLimit Question time limit in seconds
 * @param timeTaken Time taken to answer in seconds
 * @param basePoints Base points for the question
 */
export function calculateScore(
  isCorrect: boolean,
  timeLimit: number = 30,
  timeTaken: number = 0,
  basePoints: number = 1000
): number {
  if (!isCorrect) return 0;
  
  // Award more points for faster answers
  const timeBonus = Math.max(0, (timeLimit - timeTaken) / timeLimit);
  const score = Math.round(basePoints * (0.5 + 0.5 * timeBonus));
  
  return score;
}

/**
 * Calculate leaderboard from players
 */
export function calculateLeaderboard(players: Array<{ id: string; name: string; score: number }>): Array<{ playerId: string; playerName: string; score: number; rank: number }> {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  
  return sorted.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    score: player.score,
    rank: index + 1
  }));
}

/**
 * Select random winner(s) for raffle
 */
export function selectRandomWinners(
  players: Array<{ id: string; name: string }>,
  count: number = 1
): Array<{ playerId: string; playerName: string }> {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(p => ({
    playerId: p.id,
    playerName: p.name
  }));
}

/**
 * Validate question based on type
 */
export function validateQuestion(question: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!question.title || question.title.trim().length === 0) {
    errors.push('Question title is required');
  }
  
  if (!question.type) {
    errors.push('Question type is required');
  }
  
  if (question.type === 'multiple_choice' || question.type === 'poll') {
    if (!question.options || question.options.length < 2) {
      errors.push('Multiple choice and poll questions require at least 2 options');
    }
  }
  
  if (question.type === 'multiple_choice') {
    if (question.correctAnswer === undefined || question.correctAnswer === null) {
      errors.push('Multiple choice questions require a correct answer');
    }
  }
  
  if (question.type === 'scale') {
    if (question.scaleMin === undefined || question.scaleMax === undefined) {
      errors.push('Scale questions require min and max values');
    }
    if (question.scaleMin >= question.scaleMax) {
      errors.push('Scale min must be less than max');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
