import {expect, test} from '@playwright/test';
import {CartPagePO} from '../utils/page-objects/cart-page';
import {HistoryPagePO} from '../utils/page-objects/history-page';
import {MenuPagePO} from '../utils/page-objects/menu-page';
import {setupViewport} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('Integration - Checkout Flow', () => {
    let cartPagePO: CartPagePO;
    let historyPagePO: HistoryPagePO;
    let menuPagePO: MenuPagePO;

    beforeEach(async ({page}) => {
        cartPagePO = new CartPagePO(page);
        historyPagePO = new HistoryPagePO(page);
        menuPagePO = new MenuPagePO(page);
    });


    test('12. Order flows correctly from cart to history with proper navigation (score: 2)', async ({page}) => {
        await page.addInitScript(() => {
            const FixedDate = class extends Date {
                constructor() {
                    super();
                    this.setTime(1703498400000);
                }

                static now() {
                    return 1703498400000;
                }
            };

            // @ts-ignore
            globalThis.Date = FixedDate;

            Date.prototype.toLocaleDateString = function () {
                return '25.12.2023';
            };
        });

        await page.addInitScript(() => {
            localStorage.setItem(
                'cart',
                JSON.stringify([
                    {id: 'yacht-001', title: 'Azimut 77 Yacht', type: 'Yacht', price: 3500000, image: 'images/yachts/yacht-001.jpg'},
                    {id: 'plane-001', title: 'Gulfstream G650ER', type: 'Plane', price: 75000000, image: 'images/planes/plane-001.jpg'},
                ])
            );

            localStorage.setItem(
                'profile',
                JSON.stringify({
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    notifications: false,
                })
            );
        });

        await setupViewport(page, false);
        await page.goto('/cart.html');
        await expect(cartPagePO.cartItems).toHaveCount(2);

        await cartPagePO.checkoutButton.click();

        await page.waitForTimeout(2000);

        await expect(page).toHaveURL(/.*history.html/);

        await expect(historyPagePO.ordersList).toBeVisible();
        await expect(historyPagePO.orderItems).toHaveCount(1);

        const orderItem = historyPagePO.getOrderItemByIndex(0);
        await expect(orderItem).toContainText('Azimut 77 Yacht');
        await expect(orderItem).toContainText('Gulfstream G650ER');
        await expect(orderItem).toContainText('$78,500,000');

        const orderText = await orderItem.textContent();
        await expect(orderText).toContain('ORD-1703498400000');
        await expect(orderText).toContain('25.12.2023');

        await menuPagePO.cartButton.click();
        await expect(cartPagePO.cartEmpty).toBeVisible();
    });
});
