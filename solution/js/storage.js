export const STORAGE_KEYS = {
    PRODUCTS: 'products',
    CART: 'cart',
    PROFILE: 'profile',
    ORDERS: 'orders',
    THEME: 'theme',
};

export function readStorage(key, fallback) {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}
