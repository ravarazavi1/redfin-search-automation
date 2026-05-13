export interface A11yViolationSummary {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
  description: string;
  helpUrl: string;
  nodeCount: number;
}

export interface A11yResultDto {
  url: string;
  violationCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  violations: A11yViolationSummary[];
  passCount: number;
  incompleteCount: number;
}
