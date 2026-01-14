import {expect, test} from '@playwright/test';
import {CartPagePO} from '../utils/page-objects/cart-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Cart - Display', () => {
    let pagePO: CartPagePO;

    beforeEach(async ({page}) => {
        pagePO = new CartPagePO(page);
    });

    test('2. Empty cart is displayed (score: 1)', async ({page}) => {
        await setupViewport(page, false);
        await page.goto('/cart.html');
        await expect(pagePO.cartEmpty).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.CART_EMPTY);
    });

    test('3. Cart with items displays correctly on desktop (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'cart',
                JSON.stringify([
                    {id: 'yacht-001', title: 'Azimut 77 Yacht', type: 'Yacht', price: 3500000, image: 'images/yachts/yacht-001.jpg'},
                    {id: 'plane-001', title: 'Gulfstream G650ER', type: 'Plane', price: 75000000, image: 'images/planes/plane-001.jpg'},
                ])
            );
        });

        await setupViewport(page, false);
        await page.goto('/cart.html');

        await expect(pagePO.cartList).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.CART_ITEMS);
    });

    test('4. Cart with items displays correctly in dark theme (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem('theme', 'dark');
            localStorage.setItem(
                'cart',
                JSON.stringify([
                    {id: 'mansion-001', title: 'Beverly Hills Mansion', type: 'Mansion', price: 125000000, image: 'images/mansions/mansion-001.jpg'},
                    {id: 'yacht-002', title: 'Benetti 164 Superyacht', type: 'Yacht', price: 45000000, image: 'images/yachts/yacht-002.jpg'},
                ])
            );
        });

        await setupViewport(page, false);
        await page.goto('/cart.html');

        await expect(pagePO.cartList).toHaveScreenshot(SCREENSHOT_NAMES.DARK_THEME_CART);
    });

    test('5. Cart with items displays correctly on mobile (score: 2)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'cart',
                JSON.stringify([
                    {id: 'mansion-001', title: 'Beverly Hills Mansion', type: 'Mansion', price: 125000000, image: 'images/mansions/mansion-001.jpg'},
                    {id: 'yacht-002', title: 'Benetti 164 Superyacht', type: 'Yacht', price: 45000000, image: 'images/yachts/yacht-002.jpg'},
                    {id: 'island-001', title: 'Private Caribbean Island', type: 'Island', price: 250000000, image: 'images/islands/island-001.jpg'},
                ])
            );
        });

        await setupViewport(page, true);
        await page.goto('/cart.html');

        await expect(pagePO.cartList).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.CART_MOBILE);
    });

    test('6. Cart item displays correctly on mobile (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'cart',
                JSON.stringify([
                    {id: 'island-001', title: 'Private Caribbean Island', type: 'Island', price: 250000000, image: 'images/islands/island-001.jpg'},
                ])
            );
        });

        await setupViewport(page, true);
        await page.goto('/cart.html');
        const firstItem = pagePO.getCartItemByIndex(0);
        await expect(firstItem).toHaveScreenshot(SCREENSHOT_NAMES.CART_ITEM);
    });
});
