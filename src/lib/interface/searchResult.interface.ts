export interface SearchResultDto {
  headerText: string | null;
  currentUrl: string;
  searchInputValue: string;
  blockedByAntiBot: boolean;
}

export interface NavigationResultDto {
  finalUrl: string;
  staysOnHomepage: boolean;
}
