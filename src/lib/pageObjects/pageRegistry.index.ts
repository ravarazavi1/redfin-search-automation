import type { Page } from '@playwright/test';
import { HomePage } from './homePage.page';
import { ResultsPage } from './resultsPage.page';
import { Logger } from '../helpers/logger';

export class PageRegistry {
  homePage: HomePage;
  resultsPage: ResultsPage;

  constructor(page: Page, logger: Logger) {
    this.homePage = new HomePage(page, logger);
    this.resultsPage = new ResultsPage(page, logger);
  }
}
