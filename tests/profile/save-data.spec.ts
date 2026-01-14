import {expect, test} from '@playwright/test';
import {ProfilePagePO} from '../utils/page-objects/profile-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Profile - Data Saving', () => {
    let pagePO: ProfilePagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProfilePagePO(page);
    });

    test('29. Profile page on desktop with empty fields (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/profile.html');

        await expect(pagePO.profileContainer).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.PROFILE_INPUTS_EMPTY);
    });

    test('30. Success message "Data saved" is displayed after saving (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/profile.html');
        await pagePO.nameInput.fill('John Doe');
        await pagePO.emailInput.fill('john.doe@example.com');
        await pagePO.saveButton.click();

        const notification = page.locator('text=Data saved');
        await expect(notification).toBeVisible();
    });

    test('31. Profile page on mobile with filled fields (score: 2)', async ({page}) => {
        await setupViewport(page, true);
        await page.goto('/profile.html');
        await pagePO.nameInput.fill('John Doe');
        await pagePO.emailInput.fill('john.doe@example.com');
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.PROFILE_INPUTS_FILLED);
    });

    test('32. Notification checkbox saves its state (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/profile.html');
        await pagePO.nameInput.fill('John Doe');
        await pagePO.emailInput.fill('john.doe@example.com');

        await expect(pagePO.notificationsCheckbox).toHaveScreenshot(SCREENSHOT_NAMES.PROFILE_CHECKBOX_UNCHECKED);

        await pagePO.notificationsCheckbox.click();
        await pagePO.saveButton.click();
        await page.reload();

        await expect(pagePO.notificationsCheckbox).toBeChecked();

        await expect(pagePO.notificationsCheckbox).toHaveScreenshot(SCREENSHOT_NAMES.PROFILE_CHECKBOX_CHECKED);

        await pagePO.notificationsCheckbox.click();
        await pagePO.saveButton.click();
        await page.reload();

        await expect(pagePO.notificationsCheckbox).not.toBeChecked();
    });

    test('33. Profile page in dark theme on desktop (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/profile.html');

        const themeToggle = page.locator('[data-test-id="theme-toggle"]');
        await themeToggle.click();

        await expect(pagePO.profileContainer).toHaveScreenshot(SCREENSHOT_NAMES.DARK_THEME_PROFILE);
    });
});
