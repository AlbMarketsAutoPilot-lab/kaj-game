// Facts for the citizenship exam and the airline quiz (task C).
// Each fact is one study line plus one a/b question about it.

export interface Fact {
  text: string;
  question: string;
  right: string;
  wrong: string;
}

// Area id -> its facts (about 12 per area).
export type FactBatch = Record<string, Fact[]>;

export const f = (text: string, question: string, right: string, wrong: string): Fact => ({ text, question, right, wrong });
