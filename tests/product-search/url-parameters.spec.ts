import {expect, test} from '@playwright/test';
import {ProductListPagePO} from '../utils/page-objects/product-list-page';
import {setupViewport} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Product Search - URL Parameter Handling', () => {
    let pagePO: ProductListPagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProductListPagePO(page);
    });

    test('27. Multiple filter parameters are restored when opening page with filters query (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/?filters=Yacht%2CPlane');

        const yachtFilter = pagePO.getFilterButtonByType('Yacht');
        const planeFilter = pagePO.getFilterButtonByType('Plane');
        await expect(yachtFilter).toBeChecked();
        await expect(planeFilter).toBeChecked();

        const filteredCount = await pagePO.productCards.count();
        expect(filteredCount).toBe(6);
    });

    test('28. Search parameter is removed from URL when search is cleared (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        await pagePO.searchInput.fill('yacht');
        await pagePO.searchInput.press('Enter');

        await expect(page).toHaveURL(/.*search=yacht.*/);

        await pagePO.searchInput.fill('');
        await pagePO.searchInput.press('Enter');

        await expect(page).not.toHaveURL(/.*search=.*/);
    });
});
