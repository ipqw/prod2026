import {expect, test} from '@playwright/test';
import {ProductListPagePO} from '../utils/page-objects/product-list-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Product Modal - Opening', () => {
    let pagePO: ProductListPagePO;

    beforeEach(async ({page}) => {
        pagePO = new ProductListPagePO(page);
    });

    test('21. Modal opens when clicking on product card on desktop (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const firstProduct = pagePO.getProductCardByIndex(0);
        await firstProduct.click();

        await expect(pagePO.modal).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.MODAL_OPEN);
    });

    test('22. Modal opens when clicking on product card on mobile (score: 2)', async ({page}) => {
        await setupViewport(page, true);
        await page.goto('/');
        await expect(pagePO.productCards.first()).toBeVisible();

        const secondProduct = pagePO.getProductCardByIndex(1);
        await secondProduct.click();

        await expect(pagePO.modal).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.MODAL_MOBILE);
    });
});
