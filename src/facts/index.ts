import { batch1 } from './batch1.ts';
import { batch2 } from './batch2.ts';
import { batch3 } from './batch3.ts';
import type { FactBatch } from './types.ts';

export type { Fact, FactBatch } from './types.ts';

// Batches written so far (5 planned, 10 areas each).
export const FACT_BATCHES: FactBatch[] = [batch1, batch2, batch3];
