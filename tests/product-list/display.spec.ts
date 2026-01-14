import {expect, test} from '@playwright/test';
import {ProductListPagePO} from '../utils/page-objects/product-list-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Product List - Display', () => {
    let pagePO: ProductListPagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProductListPagePO(page);
    });

    test('15. Product list is displayed on desktop (score: 2)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productList).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.PRODUCT_LIST);
    });

    test('16. Product list is displayed on mobile (score: 1)', async ({page}) => {
        await setupViewport(page, true);
        await page.goto('/');
        await expect(pagePO.productList).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.PRODUCT_LIST_MOBILE);
    });

    test('17. Skeleton is displayed during loading on desktop (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.route('**/data.json', async route => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await route.continue();
        });
        await page.goto('/');
        await expect(pagePO.skeletonCards.first()).toBeVisible();
        await expect(pagePO.skeletonCards.first()).toHaveScreenshot(SCREENSHOT_NAMES.PRODUCT_CARD_SKELETON);
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.PRODUCT_LIST_SKELETON);
    });

    test('18. Product card contains required elements (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const firstProduct = pagePO.getProductCardByIndex(0);
        await expect(firstProduct).toHaveScreenshot(SCREENSHOT_NAMES.PRODUCT_CARD);
        await expect(pagePO.getProductTitle(firstProduct)).toBeVisible();
        await expect(pagePO.getProductType(firstProduct)).toBeVisible();
        await expect(pagePO.getProductPrice(firstProduct)).toBeVisible();
    });

    test('19. Hover effect on product card (score: 2)', async ({page}) => {
        await setupViewport(page, true);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const firstProduct = pagePO.getProductCardByIndex(0);
        await firstProduct.hover();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.PRODUCT_LIST_HOVER);
    });
});
