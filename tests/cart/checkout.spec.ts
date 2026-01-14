import {expect, test} from '@playwright/test';
import {CartPagePO} from '../utils/page-objects/cart-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Cart - Checkout', () => {
    let pagePO: CartPagePO;

    beforeEach(async ({page}) => {
        pagePO = new CartPagePO(page);
    });

    test('1. Checkout process shows cancel button and completes after delay (score: 2)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'cart',
                JSON.stringify([
                    {id: 'island-001', title: 'Private Caribbean Island', type: 'Island', price: 250000000, image: 'images/islands/island-001.jpg'},
                ])
            );

            localStorage.setItem(
                'profile',
                JSON.stringify({
                    name: 'Marcus Wellington',
                    email: 'marcus.wellington@example.com',
                    notifications: false,
                })
            );
        });

        await setupViewport(page, false);
        await page.goto('/cart.html');
        await expect(pagePO.checkoutButton).toBeVisible();

        await pagePO.checkoutButton.click();
        await expect(pagePO.checkoutButton).toBeDisabled();
        await expect(pagePO.cancelCheckoutButton).toBeVisible();
        await expect(pagePO.cartList).toHaveScreenshot(SCREENSHOT_NAMES.CART_PROCESSING);

        await page.waitForTimeout(1500);
        await expect(pagePO.cancelCheckoutButton).not.toBeVisible();
    });
});
