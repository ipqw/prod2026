import {expect, test} from '@playwright/test';
import {ProductListPagePO} from '../utils/page-objects/product-list-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Product Seach - Search', () => {
    let pagePO: ProductListPagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProductListPagePO(page);
    });

    test('24. Search suggestions are displayed when typing on mobile (score: 2)', async ({page}) => {
        await setupViewport(page, true);
        await page.goto('/');

        await expect(pagePO.productCards.first()).toBeVisible();

        await pagePO.searchInput.fill('be');
        await expect(pagePO.searchSuggestions).toBeVisible();
        await page.waitForTimeout(1500);

        const suggestionCount = await pagePO.suggestionItems.count();
        expect(suggestionCount).toBe(3);

        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.SEARCH_SUGGESTIONS_ACTIVE);
    });

    test('25. Search suggestions show loading state on mobile (score: 1)', async ({page}) => {
        await setupViewport(page, true);
        await page.goto('/');

        await expect(pagePO.productCards.first()).toBeVisible();

        await page.route('**/data.json', async route => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.continue();
        });

        await pagePO.searchInput.fill('Luxury');

        await expect(pagePO.searchSuggestions).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.SEARCH_SUGGESTIONS_LOADING);
    });

    test('26. Search works with filters combined (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const yachtFilter = pagePO.getFilterButtonByType('Yacht');
        await yachtFilter.click();

        await pagePO.searchInput.fill('r');
        await pagePO.searchInput.press('Enter');

        await expect(page).toHaveURL(/.*filters=.*&search=r$/);

        const filteredCount = await pagePO.productCards.count();
        expect(filteredCount).toBe(2);
    });
});
