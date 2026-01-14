import {Locator, Page} from '@playwright/test';

export class ThemePagePO {
    constructor(private readonly page: Page) {}

    themeToggle = this.page.getByTestId('theme-toggle');
}
