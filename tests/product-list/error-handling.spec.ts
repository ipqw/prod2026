import {expect, test} from '@playwright/test';
import {ProductListPagePO} from '../utils/page-objects/product-list-page';
import {setupViewport} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Product List - Error Handling', () => {
    let pagePO: ProductListPagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProductListPagePO(page);
    });

    test('20. Shows error message when data.json is missing (score: 1)', async ({page}) => {
        await setupViewport(page, false);

        await page.route('**/data.json', async route => {
            route.fulfill({
                status: 404,
                contentType: 'text/plain',
                body: 'Not Found',
            });
        });

        await page.goto('/');

        const errorMessage = page.locator('text=Failed to load products');
        await expect(errorMessage).toBeVisible();
        await expect(pagePO.productList).not.toBeVisible();
    });
});
