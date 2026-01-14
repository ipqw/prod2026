import {Locator, Page} from '@playwright/test';

export class CartPagePO {
    constructor(private readonly page: Page) {}

    cartList = this.page.getByTestId('cart-list');
    cartEmpty = this.page.getByTestId('cart-empty');

    cartItems = this.page.getByTestId('cart-item');
    getCartItemByIndex(index: number) {
        return this.cartItems.nth(index);
    }

    getCartItemTitle(cartItem: Locator) {
        return cartItem.getByTestId('cart-item-title');
    }

    getCartItemPrice(cartItem: Locator) {
        return cartItem.getByTestId('cart-item-price');
    }

    getCartItemRemoveButton(cartItem: Locator) {
        return cartItem.getByTestId('cart-remove');
    }

    cartTotal = this.page.getByTestId('cart-total');

    checkoutButton = this.page.getByTestId('checkout-button');
    loginToPlaceOrderButton = this.page.getByRole('button', {name: 'Login to place an order'});
    cancelCheckoutButton = this.page.getByTestId('cancel-checkout-button');

    removeConfirmModal = this.page.getByTestId('remove-confirm-modal');
    confirmRemoveButton = this.page.getByTestId('confirm-remove');
    cancelRemoveButton = this.page.getByTestId('cancel-remove');
}
