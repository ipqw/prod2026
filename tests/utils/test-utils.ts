import {Page} from '@playwright/test';

export const DESKTOP_VIEWPORT = {width: 1280, height: 720};
export const MOBILE_VIEWPORT = {width: 375, height: 667};

export const SCREENSHOT_NAMES = {
    PROFILE_INPUTS_EMPTY: 'profile-inputs-empty.png',
    PROFILE_INPUTS_FILLED: 'profile-inputs-filled.png',
    PROFILE_INPUTS_ERROR: 'profile-inputs-error.png',
    PROFILE_CHECKBOX_UNCHECKED: 'profile-checkbox-unchecked.png',
    PROFILE_CHECKBOX_CHECKED: 'profile-checkbox-checked.png',
    DARK_THEME_PROFILE: 'dark-theme-profile.png',
    PRODUCT_LIST: 'product-list.png',
    PRODUCT_LIST_SKELETON: 'product-list-skeleton.png',
    PRODUCT_LIST_HOVER: 'product-list-hover.png',
    PRODUCT_LIST_MOBILE: 'product-list-mobile.png',
    BOUGHT_PRODUCT_CARD: 'bought-product-card.png',
    FILTERS: 'filters.png',
    SEARCH_SUGGESTIONS_LOADING: 'search-suggestions-loading.png',
    SEARCH_SUGGESTIONS_ACTIVE: 'search-suggestions-active.png',
    PRODUCT_CARD: 'product-card.png',
    PRODUCT_CARD_SKELETON: 'product-card-skeleton.png',
    MODAL_OPEN: 'modal-open.png',
    MODAL_MOBILE: 'modal-mobile.png',
    DARK_THEME: 'dark-theme.png',
    DARK_SKELETONS: 'dark-skeletons.png',
    CART_EMPTY: 'cart-empty.png',
    CART_ITEMS: 'cart-items.png',
    CART_ITEM: 'cart-item.png',
    CART_REMOVE_MODAL: 'cart-remove-modal.png',
    CART_PROCESSING: 'cart-processing.png',
    CART_MOBILE: 'cart-mobile.png',
    ORDERS_EMPTY: 'orders-empty.png',
    ORDERS_HISTORY: 'orders-history.png',
    ORDER_MOBILE: 'order-mobile.png',
    DARK_THEME_CART: 'dark-theme-cart.png',
    DARK_THEME_ORDERS: 'dark-theme-orders.png',
};

export async function setupViewport(page: Page, isMobile: boolean = false) {
    const viewport = isMobile ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT;
    await page.setViewportSize(viewport);
}
