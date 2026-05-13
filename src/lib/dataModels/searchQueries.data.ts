export const ZipCodes = {
  alexandria:  '22304',
  arlington:   '22201',
  bethesda:    '20814',
  seattle:     '98101',
} as const;

export const Cities = {
  alexandria: 'Alexandria, VA',
  arlington:  'Arlington, VA',
  bethesda:   'Bethesda, MD',
  seattle:    'Seattle, WA',
} as const;

// Direct results-page URLs — bypass the search box and anti-bot trigger entirely
export const DirectUrls = {
  zip_22304_alexandria: 'https://www.redfin.com/zipcode/22304/',
  zip_22201_arlington:  'https://www.redfin.com/zipcode/22201/',
  zip_98101_seattle:    'https://www.redfin.com/zipcode/98101/',
} as const;
