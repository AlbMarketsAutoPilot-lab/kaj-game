import { batch1 } from './batch1.ts';
import { batch2 } from './batch2.ts';
import { batch3 } from './batch3.ts';
import { batch4 } from './batch4.ts';
import { batch5 } from './batch5.ts';
import type { FactBatch } from './types.ts';

export type { Fact, FactBatch } from './types.ts';

// All 5 batches, 10 areas each, in map order.
export const FACT_BATCHES: FactBatch[] = [batch1, batch2, batch3, batch4, batch5];
