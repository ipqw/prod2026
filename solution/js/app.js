import { applyThemeFromStorage, initThemeToggle } from './theme.js';
import { initMenu } from './navigation.js';
import { updateCartBadge } from './cart.js';
import { initShopPage, renderCartPage, renderProfilePage, renderHistoryPage } from './pages.js';
import { initGlobalSearch } from './search.js';

function initPage() {
    applyThemeFromStorage();
    initThemeToggle();
    initMenu();
    updateCartBadge();
    const page = document.body && document.body.dataset ? document.body.dataset.page : '';
    if (page === 'shop') {
        initShopPage();
    } else if (page === 'cart') {
        renderCartPage();
        initGlobalSearch();
    } else if (page === 'profile') {
        renderProfilePage();
        initGlobalSearch();
    } else if (page === 'history') {
        renderHistoryPage();
        initGlobalSearch();
    }
}

document.addEventListener('DOMContentLoaded', initPage);
