import {Locator, Page} from '@playwright/test';

export class ProfilePagePO {
    constructor(private readonly page: Page) {}

    profileContainer = this.page.getByTestId('profile');
    nameInput = this.page.getByTestId('profile-name');
    emailInput = this.page.getByTestId('profile-email');
    notificationsCheckbox = this.page.getByTestId('profile-notifications');
    saveButton = this.page.getByTestId('profile-save');
}
