import {expect, test} from '@playwright/test';
import {ProductListPagePO} from '../utils/page-objects/product-list-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Product List - Bought Products', () => {
    let pagePO: ProductListPagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProductListPagePO(page);
    });

    test('13. Bought products are visually marked as purchased (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'orders',
                JSON.stringify([
                    {
                        id: 'ORD-1234567890',
                        date: '01.01.2023',
                        products: [{id: 'yacht-001', title: 'Azimut 77 Yacht', type: 'Yacht', price: 3500000, image: 'images/yachts/yacht-001.jpg'}],
                        total: 3500000,
                    },
                ])
            );
        });

        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const boughtProductCard = pagePO.productCards.filter({has: page.locator('[data-test-id="product-title"]', {hasText: 'Azimut 77 Yacht'})});
        await expect(boughtProductCard).toBeVisible();

        await expect(boughtProductCard).toHaveScreenshot(SCREENSHOT_NAMES.BOUGHT_PRODUCT_CARD);
    });

    test('14. Non-bought products still open modal when clicked (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'orders',
                JSON.stringify([
                    {
                        id: 'ORD-1234567890',
                        date: '01.01.2023',
                        products: [{id: 'yacht-001', title: 'Azimut 77 Yacht', type: 'Yacht', price: 3500000, image: 'images/yachts/yacht-001.jpg'}],
                        total: 3500000,
                    },
                ])
            );
        });

        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const nonBoughtProductCard = pagePO.productCards.filter({hasNot: page.locator('[data-test-id="product-title"]', {hasText: 'Azimut 77 Yacht'})}).first();
        await nonBoughtProductCard.click();

        await expect(pagePO.modal).toBeVisible();
    });
});
