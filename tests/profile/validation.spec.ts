import {expect, test} from '@playwright/test';
import {ProfilePagePO} from '../utils/page-objects/profile-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Profile - Validation', () => {
    let pagePO: ProfilePagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProfilePagePO(page);
    });

    test('34. Name and e-mail fields are required on desktop (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/profile.html');
        await pagePO.nameInput.fill('');
        await pagePO.emailInput.fill('');
        await pagePO.saveButton.click();

        await expect(pagePO.profileContainer).toContainText('Name is required');
        await expect(pagePO.profileContainer).toContainText('E-mail is required');
        await expect(pagePO.profileContainer).toHaveScreenshot(SCREENSHOT_NAMES.PROFILE_INPUTS_ERROR);
    });

    test('35. E-mail with multiple @ fails validation (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/profile.html');
        await pagePO.nameInput.fill('John Doe');
        await pagePO.emailInput.fill('user@@domain.com');
        await pagePO.saveButton.click();

        await expect(pagePO.profileContainer).toContainText('E-mail must contain exactly one @ symbol');
    });

    test('36. E-mail with multiple dots after @ fails validation (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/profile.html');
        await pagePO.nameInput.fill('John Doe');
        await pagePO.emailInput.fill('user@domain.com.uk');
        await pagePO.saveButton.click();

        await expect(pagePO.profileContainer).toContainText('E-mail must contain exactly one dot after @');
    });
});
