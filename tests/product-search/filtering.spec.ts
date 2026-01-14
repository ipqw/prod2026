import {expect, test} from '@playwright/test';
import {ProductListPagePO} from '../utils/page-objects/product-list-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Product Search - Filtering', () => {
    let pagePO: ProductListPagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProductListPagePO(page);
    });

    test('23. Filtering by category works (score: 2)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const yachtFilter = pagePO.getFilterButtonByType('Yacht');
        await yachtFilter.click();

        await expect(page).toHaveURL(/.*filters=.*/);
        const filteredCount = await pagePO.productCards.count();
        expect(filteredCount).toBe(3);

        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.FILTERS);
    });
});
