export interface LocationResultDto {
  zip: string;
  found: boolean;
  city: string | null;
  state: string | null;
  displayName: string | null;
  latitude: number | null;
  longitude: number | null;
  rawResponse: unknown;
}
