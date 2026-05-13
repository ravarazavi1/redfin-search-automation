export interface BrowserSetupOptions {
  viewport?: { width: number; height: number };
  skipStorageState?: boolean;
}

export interface BaseTestScenario<
  TWorkflow extends string,
  TExpectedResults,
  TActionsData = undefined
> {
  testName: string;
  description?: string;
  tags: string[];
  testRailId: string;
  browserSetupOptions?: BrowserSetupOptions;
  skip?: boolean | string;
  workflow: TWorkflow;
  expectedResults: TExpectedResults;
  actionsData?: TActionsData;
}
