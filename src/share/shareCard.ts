import type { HistoricalCharacter, MatchResult } from '../types';
export interface ShareCardData {
  primary: HistoricalCharacter;
  secondary: HistoricalCharacter;
  closeness: number;
  shareUrl?: string;
  qrCode?: string;
  campaignId?: string;
}
export const getShareCardData = (
  match: MatchResult,
  extra: Partial<Pick<ShareCardData, 'shareUrl' | 'qrCode' | 'campaignId'>> = {},
): ShareCardData => ({
  primary: match.primary.character,
  secondary: match.secondary.character,
  closeness: match.primary.closeness,
  ...extra,
});
