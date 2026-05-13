export const CensusZips = {
  alexandria_22304: '22304',
  arlington_22201:  '22201',
  seattle_98101:    '98101',
  bethesda_20814:   '20814',
  miami_33101:      '33101',
} as const;

export type CensusZip = (typeof CensusZips)[keyof typeof CensusZips];
