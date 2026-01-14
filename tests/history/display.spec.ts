import {expect, test} from '@playwright/test';
import {HistoryPagePO} from '../utils/page-objects/history-page';
import {setupViewport, SCREENSHOT_NAMES} from '../utils/test-utils';

const {describe, beforeEach} = test;

describe('History - Display', () => {
    let pagePO: HistoryPagePO;

    beforeEach(async ({page}) => {
        pagePO = new HistoryPagePO(page);
    });

    test('8. Empty history is displayed (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.removeItem('orders');
        });

        await setupViewport(page);
        await page.goto('/history.html');
        await expect(pagePO.ordersEmpty).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.ORDERS_EMPTY);
    });

    test('9. History with orders displays correctly on desktop (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'orders',
                JSON.stringify([
                    {
                        id: 'ORD-1234567890',
                        date: '01.01.2023',
                        products: [
                            {id: '1', title: 'Test Yacht'},
                            {id: '2', title: 'Test Plane'},
                        ],
                        total: 6000000,
                    },
                    {
                        id: 'ORD-0987654321',
                        date: '15.01.2023',
                        products: [
                            {id: '3', title: 'Test Car'},
                            {id: '4', title: 'Test Bike'},
                        ],
                        total: 75000,
                    },
                    {
                        id: 'ORD-1122334455',
                        date: '20.01.2023',
                        products: [{id: '5', title: 'Test Boat'}],
                        total: 250000,
                    },
                ])
            );
        });

        await setupViewport(page);
        await page.goto('/history.html');
        await expect(pagePO.ordersList).toBeVisible();
        await expect(pagePO.orderItems).toHaveCount(3);

        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.ORDERS_HISTORY);
    });

    test('10. History order displays correctly on mobile (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem(
                'orders',
                JSON.stringify([
                    {
                        id: 'ORD-9876543210',
                        date: '10.02.2023',
                        products: [
                            {id: '7', title: 'Luxury Supercar'},
                            {id: '8', title: 'Private Jet Charter'},
                            {id: '9', title: 'Golden Golf Set'},
                        ],
                        total: 8250000,
                    },
                    {
                        id: 'ORD-5555555555',
                        date: '18.02.2023',
                        products: [
                            {id: '10', title: 'Vintage Wine Collection'},
                            {id: '11', title: 'Diamond Watch'},
                        ],
                        total: 1250000,
                    },
                ])
            );
        });

        await setupViewport(page, true);
        await page.goto('/history.html');
        await expect(pagePO.ordersList).toBeVisible();
        await expect(pagePO.orderItems).toHaveCount(2);

        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.ORDER_MOBILE);
    });

    test('11. History with orders displays correctly in dark theme on mobile (score: 1)', async ({page}) => {
        await page.addInitScript(() => {
            localStorage.setItem('theme', 'dark');
            localStorage.setItem(
                'orders',
                JSON.stringify([
                    {
                        id: 'ORD-1234567890',
                        date: '01.01.2023',
                        products: [
                            {id: '1', title: 'Test Yacht'},
                            {id: '2', title: 'Test Plane'},
                        ],
                        total: 6000000,
                    },
                    {
                        id: 'ORD-0987654321',
                        date: '15.01.2023',
                        products: [
                            {id: '3', title: 'Test Car'},
                            {id: '4', title: 'Test Bike'},
                        ],
                        total: 75000,
                    },
                    {
                        id: 'ORD-1122334455',
                        date: '20.01.2023',
                        products: [{id: '5', title: 'Test Boat'}],
                        total: 250000,
                    },
                ])
            );
        });

        await setupViewport(page, true);
        await page.goto('/history.html');

        await expect(pagePO.ordersList).toBeVisible();
        await expect(page).toHaveScreenshot(SCREENSHOT_NAMES.DARK_THEME_ORDERS);
    });
});
