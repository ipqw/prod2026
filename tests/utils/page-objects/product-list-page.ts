import {Locator, Page} from '@playwright/test';

export class ProductListPagePO {
    constructor(private readonly page: Page) {}

    productList = this.page.getByTestId('product-list');

    productCards = this.page.getByTestId('product-card');
    getProductCardByIndex(index: number) {
        return this.productCards.nth(index);
    }

    getProductTitle(productCard: Locator) {
        return productCard.getByTestId('product-title');
    }

    getProductType(productCard: Locator) {
        return productCard.getByTestId('product-type');
    }

    getProductPrice(productCard: Locator) {
        return productCard.getByTestId('product-price');
    }

    skeletonCards = this.page.getByTestId('skeleton-card');

    searchInput = this.page.getByTestId('search-input');
    searchSuggestions = this.page.getByTestId('search-suggestions');
    suggestionItems = this.page.getByTestId('suggestion-item');
    getSuggestionItemByIndex(index: number) {
        return this.suggestionItems.nth(index);
    }

    filterButtons = this.page.getByTestId('filter');
    getFilterButtonByType(type: string) {
        return this.filterButtons.filter({hasText: type});
    }

    modal = this.page.getByTestId('modal');
    modalCloseButton = this.page.getByTestId('modal-close');
    modalTitle = this.page.getByTestId('modal-title');
    modalDescription = this.page.getByTestId('modal-description');
    addToCartButton = this.page.getByTestId('add-to-cart');
    removeFromCartButton = this.page.getByTestId('remove-from-cart');
    modalPrice = this.page.getByTestId('modal-price');
}
