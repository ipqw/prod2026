export function navigateTo(path) {
    window.location.href = path;
}

export function initMenu() {
    const shopBtn = document.querySelector('[data-test-id="menu-shop"]');
    const cartBtn = document.querySelector('[data-test-id="menu-cart"]');
    const profileBtn = document.querySelector('[data-test-id="menu-profile"]');
    const historyBtn = document.querySelector('[data-test-id="menu-history"]');

    if (shopBtn) shopBtn.addEventListener('click', () => navigateTo('./'));
    if (cartBtn) cartBtn.addEventListener('click', () => navigateTo('./cart.html'));
    if (profileBtn) profileBtn.addEventListener('click', () => navigateTo('./profile.html'));
    if (historyBtn) historyBtn.addEventListener('click', () => navigateTo('./history.html'));
}
