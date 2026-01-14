import {Page} from '@playwright/test';

export class HistoryPagePO {
    constructor(private readonly page: Page) {}

    ordersList = this.page.getByTestId('orders-list');
    ordersEmpty = this.page.getByTestId('orders-empty');

    orderItems = this.page.getByTestId('orders-item');
    getOrderItemByIndex(index: number) {
        return this.orderItems.nth(index);
    }
}
