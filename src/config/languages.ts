import { DE as DE_1x1, GB as GB_1x1, ME as ME_1x1, RU as RU_1x1 } from 'country-flag-icons/react/1x1';
import { DE as DE_3x2, GB as GB_3x2, ME as ME_3x2, RU as RU_3x2 } from 'country-flag-icons/react/3x2';
import type { FC } from 'react';

type FlagComponent = FC<{ title: string; className: string }>;

export interface LanguageConfig {
  code: string;
  title: string;
  Flag: FlagComponent;
  FlagWide: FlagComponent;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'me', title: 'Crnogorski', Flag: ME_1x1, FlagWide: ME_3x2 },
  { code: 'en', title: 'English',    Flag: GB_1x1, FlagWide: GB_3x2 },
  { code: 'ru', title: 'Русский',    Flag: RU_1x1, FlagWide: RU_3x2 },
  { code: 'de', title: 'Deutsch',    Flag: DE_1x1, FlagWide: DE_3x2 },
];
