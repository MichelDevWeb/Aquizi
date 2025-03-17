export interface Vocabulary {
  id: string;
  word: string;
  definition: string;
  example: string;
  pronunciation: string;
  vietnameseTranslation: string;
  difficulty: string;
  audioUrl: string | null;
  synonyms?: string[];
  antonyms?: string[];
  usageNotes?: string;
  partOfSpeech?: string;
}

export interface Score {
  id: string;
  userId: string;
  username?: string;
  score: number;
  wordsCorrect: string[];
  wordsIncorrect: string[];
  createdAt: Date | null;
} 