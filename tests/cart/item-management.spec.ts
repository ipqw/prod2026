import {expect, test} from '@playwright/test';
import {CartPagePO} from '../utils/page-objects/cart-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Cart - Item Management', () => {
    let pagePO: CartPagePO;

    beforeEach(async ({page}) => {
        pagePO = new CartPagePO(page);
    });

    test('7. Removing item from cart shows confirmation modal (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'cart',
                JSON.stringify([{id: 'yacht-001', title: 'Azimut 77 Yacht', type: 'Yacht', price: 3500000, image: 'images/yachts/yacht-001.jpg'}])
            );
        });

        await setupViewport(page, false);
        await page.goto('/cart.html');
        await expect(pagePO.cartItems).toHaveCount(1);

        const item = pagePO.getCartItemByIndex(0);
        const removeButton = pagePO.getCartItemRemoveButton(item);
        await removeButton.click();

        await expect(pagePO.removeConfirmModal).toBeVisible();
        await expect(pagePO.removeConfirmModal).toHaveScreenshot(SCREENSHOT_NAMES.CART_REMOVE_MODAL);
        await expect(pagePO.confirmRemoveButton).toBeVisible();
        await expect(pagePO.cancelRemoveButton).toBeVisible();
    });
});
