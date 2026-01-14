import {expect, test} from '@playwright/test';
import {ThemePagePO} from '../utils/page-objects/theme-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Theme - Save', () => {
    let pagePO: ThemePagePO;

    beforeEach(async ({page}) => {
        pagePO = new ThemePagePO(page);
    });

    test('37. Dark theme product list displays correctly (score: 2)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await page.waitForTimeout(2000);

        await pagePO.themeToggle.click();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.DARK_THEME);

        await page.reload();
        await page.waitForTimeout(2000);
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.DARK_THEME);
    });

    test('38. Dark theme skeletons displays correctly (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await page.waitForTimeout(2000);

        await pagePO.themeToggle.click();
        await page.reload();

        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.DARK_SKELETONS);
    });

    test('39. Theme is changed on each toggle on mobile (score: 1)', async ({page}) => {
        await setupViewport(page, true);
        await page.goto('/');

        await pagePO.themeToggle.click();

        const darkThemeHTML = await pagePO.themeToggle.innerHTML();
        expect(darkThemeHTML).toMatch(/sun\.svg/);
        expect(darkThemeHTML).not.toMatch(/moon\.svg/);

        await pagePO.themeToggle.click();

        const lightThemeHTML = await pagePO.themeToggle.innerHTML();
        expect(lightThemeHTML).toMatch(/moon\.svg/);
        expect(lightThemeHTML).not.toMatch(/sun\.svg/);
    });
});
