import { readStorage, writeStorage, STORAGE_KEYS } from './storage.js';

export function getCartItems() {
    return readStorage(STORAGE_KEYS.CART, []);
}

export function setCartItems(items) {
    writeStorage(STORAGE_KEYS.CART, items);
    updateCartBadge();
}

export function isInCart(productId) {
    const cart = getCartItems();
    return cart.some(p => p && p.id === productId);
}

export function addToCart(product) {
    const cart = getCartItems();
    if (cart.some(p => p && p.id === product.id)) return;
    cart.push({
        id: product.id,
        title: product.title,
        type: product.type,
        price: product.price,
        image: product.image,
    });
    setCartItems(cart);
}

export function removeFromCart(productId) {
    const cart = getCartItems().filter(p => p && p.id !== productId);
    setCartItems(cart);
}

export function updateCartBadge() {
    const badge = document.querySelector('[data-test-id="cart-badge"]');
    if (!badge) return;
    const cart = getCartItems();
    const count = cart.length;
    if (!count) {
        badge.hidden = true;
    } else {
        badge.hidden = false;
        badge.textContent = String(count);
    }
}
