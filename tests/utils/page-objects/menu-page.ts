import {Page} from '@playwright/test';

export class MenuPagePO {
    constructor(private readonly page: Page) {}

    shopButton = this.page.getByTestId('menu-shop');
    cartButton = this.page.getByTestId('menu-cart');
    profileButton = this.page.getByTestId('menu-profile');
    historyButton = this.page.getByTestId('menu-history');

    cartBadge = this.page.getByTestId('cart-badge');

    themeToggle = this.page.getByTestId('theme-toggle');
}
