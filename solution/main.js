const STORAGE_KEYS = {
    PRODUCTS: 'products',
    CART: 'cart',
    PROFILE: 'profile',
    ORDERS: 'orders',
    THEME: 'theme',
};

function readStorage(key, fallback) {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

function applyThemeFromStorage() {
    const saved = readStorage(STORAGE_KEYS.THEME, 'light');
    const html = document.documentElement;
    const toggleIcon = document.querySelector('.page__theme-toggle img');
    if (saved === 'dark') {
        html.classList.add('dark-theme');
        if (toggleIcon) toggleIcon.src = './images/icons/sun.svg';
    } else {
        html.classList.remove('dark-theme');
        if (toggleIcon) toggleIcon.src = './images/icons/moon.svg';
    }
}

function initThemeToggle() {
    applyThemeFromStorage();
    const toggle = document.querySelector('[data-test-id="theme-toggle"]');
    const icon = toggle && toggle.querySelector('img');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark-theme');
        writeStorage(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        if (icon) {
            icon.src = isDark ? './images/icons/sun.svg' : './images/icons/moon.svg';
        }
    });
}

function navigateTo(path) {
    window.location.href = path;
}

function initMenu() {
    const shopBtn = document.querySelector('[data-test-id="menu-shop"]');
    const cartBtn = document.querySelector('[data-test-id="menu-cart"]');
    const profileBtn = document.querySelector('[data-test-id="menu-profile"]');
    const historyBtn = document.querySelector('[data-test-id="menu-history"]');

    if (shopBtn) shopBtn.addEventListener('click', () => navigateTo('./'));
    if (cartBtn) cartBtn.addEventListener('click', () => navigateTo('./cart.html'));
    if (profileBtn) profileBtn.addEventListener('click', () => navigateTo('./profile.html'));
    if (historyBtn) historyBtn.addEventListener('click', () => navigateTo('./history.html'));
}

function getCartItems() {
    return readStorage(STORAGE_KEYS.CART, []);
}

function setCartItems(items) {
    writeStorage(STORAGE_KEYS.CART, items);
    updateCartBadge();
}

function isInCart(productId) {
    const cart = getCartItems();
    return cart.some(p => p && p.id === productId);
}

function addToCart(product) {
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

function removeFromCart(productId) {
    const cart = getCartItems().filter(p => p && p.id !== productId);
    setCartItems(cart);
}

function updateCartBadge() {
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

function showNotification(message) {
    const root = document.getElementById('notification-root');
    if (!root) return;
    const container = document.createElement('div');
    container.className = 'notification';
    container.textContent = message;
    root.appendChild(container);
    setTimeout(() => {
        container.remove();
    }, 2000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatPrice(price) {
    try {
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(price);
    } catch {
        return `$${price}`;
    }
}

function formatDate(timestamp) {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function getQueryParams() {
    const url = new URL(window.location.href);
    const search = url.searchParams.get('search') || '';
    const filtersRaw = url.searchParams.get('filters') || '';
    const filters = filtersRaw
        ? filtersRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    return {search, filters};
}

function setQueryParams({search, filters}) {
    const url = new URL(window.location.href);
    if (search) url.searchParams.set('search', search);
    else url.searchParams.delete('search');

    if (filters && filters.length) url.searchParams.set('filters', filters.join(','));
    else url.searchParams.delete('filters');

    window.history.replaceState({}, '', url.toString());
}

async function loadProducts() {
    const cached = readStorage(STORAGE_KEYS.PRODUCTS, null);
    if (cached && Array.isArray(cached) && cached.length) return cached;

    const res = await fetch('./data.json', {cache: 'no-store'});
    const json = await res.json();
    const products = json && Array.isArray(json.products) ? json.products : null;
    if (!products) throw new Error('Invalid products');
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    return products;
}

function renderSkeletons(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.setAttribute('data-test-id', 'skeleton-card');
        card.innerHTML = `
            <div class="skeleton-card__image"></div>
            <div class="skeleton-card__content">
                <div class="skeleton-card__line skeleton-card__line--type"></div>
                <div class="skeleton-card__line skeleton-card__line--title"></div>
                <div class="skeleton-card__line skeleton-card__line--price"></div>
            </div>
        `;
        container.appendChild(card);
    }
}

function getBoughtProductIds() {
    const orders = readStorage(STORAGE_KEYS.ORDERS, []);
    const ids = new Set();
    if (!Array.isArray(orders)) return ids;
    for (const order of orders) {
        const products = order && Array.isArray(order.products) ? order.products : [];
        for (const p of products) if (p && p.id) ids.add(p.id);
    }
    return ids;
}

function filterProducts(products, {search, filters}) {
    const s = (search || '').trim().toLowerCase();
    const fset = new Set((filters || []).map(x => String(x)));
    return products.filter(p => {
        const okFilter = fset.size ? fset.has(p.type) : true;
        const okSearch = s ? String(p.title || '').toLowerCase().includes(s) : true;
        return okFilter && okSearch;
    });
}

function renderProductList(container, products) {
    const boughtIds = getBoughtProductIds();
    container.innerHTML = '';
    for (const p of products) {
        const isBought = boughtIds.has(p.id);
        const card = document.createElement('div');
        card.className = `product-card${isBought ? ' product-card--bought' : ''}`;
        card.setAttribute('data-test-id', 'product-card');
        card.dataset.productId = p.id;
        card.innerHTML = `
            <div class="product-card__image-wrapper">
                <img class="product-card__image" src="./${p.image}" alt="${p.title}" />
                ${isBought ? '<div class="product-card__bought-badge">BOUGHT</div>' : ''}
            </div>
            <div class="product-card__content">
                <div class="product-card__type" data-test-id="product-type">${p.type}</div>
                <div class="product-card__title" data-test-id="product-title">${p.title}</div>
                <div class="product-card__price" data-test-id="product-price">${formatPrice(p.price)}</div>
            </div>
        `;
        container.appendChild(card);
    }
}

function renderFilters(container, selected) {
    const types = ['Yacht', 'Plane', 'Mansion', 'Island'];
    container.innerHTML = '';
    for (const t of types) {
        const label = document.createElement('label');
        label.className = 'filter';
        label.dataset.filterType = t;
        label.setAttribute('data-test-id', 'filter');

        const input = document.createElement('input');
        input.className = 'filter__input';
        input.type = 'checkbox';
        input.checked = selected.includes(t);
        input.value = t;

        const box = document.createElement('span');
        box.className = 'filter__checkbox';

        const text = document.createElement('span');
        text.textContent = t;

        label.appendChild(input);
        label.appendChild(box);
        label.appendChild(text);
        container.appendChild(label);
    }
}

let cachedProducts = [];

function initSearchSuggestions({getAllProducts, onPickSuggestion, onEnterSearch}) {
    const input = document.querySelector('[data-test-id="search-input"]');
    const box = document.querySelector('[data-test-id="search-suggestions"]');
    if (!input || !box) return;

    let renderTimer = null;

    function clearTimers() {
        if (renderTimer) window.clearTimeout(renderTimer);
        renderTimer = null;
    }

    function hide() {
        box.innerHTML = '';
    }

    input.addEventListener('input', () => {
        const value = String(input.value || '');
        clearTimers();

        if (!value.trim()) {
            hide();
            return;
        }

        box.innerHTML = `<div class="suggestion suggestion--loading">Loading...</div>`;

        renderTimer = window.setTimeout(() => {
            const q = value.trim().toLowerCase();
            const all = getAllProducts();
            const list = all
                .filter(p => String(p.title || '').toLowerCase().includes(q))
                .sort((a, b) => String(a.title).localeCompare(String(b.title)))
                .slice(0, 3);

            box.innerHTML = '';
            for (const p of list) {
                const item = document.createElement('div');
                item.className = 'suggestion';
                item.setAttribute('data-test-id', 'suggestion-item');
                item.textContent = p.title;
                item.dataset.productId = p.id;
                box.appendChild(item);
            }
        }, 1500);
    });

    input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        clearTimers();
        hide();
        onEnterSearch(String(input.value || ''));
    });

    box.addEventListener('mousedown', e => {
        const target = e.target && e.target.closest('[data-test-id="suggestion-item"]');
        if (!target) return;
        e.preventDefault();
        clearTimers();
        const id = target.dataset.productId;
        const title = target.textContent || '';
        hide();
        onPickSuggestion({id, title});
    });

    document.addEventListener('click', e => {
        const isInside = e.target === input || (box.contains(e.target) && e.target !== document.body);
        if (!isInside) hide();
    });
}

function closeModal() {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = '';
}

function openProductModal(product) {
    const root = document.getElementById('modal-root');
    if (!root) return;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.setAttribute('data-test-id', 'modal');

    const modal = document.createElement('div');
    modal.className = 'modal';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal__close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('data-test-id', 'modal-close');
    closeBtn.innerHTML = '<img src="./images/icons/close.svg" alt="Close" />';

    const img = document.createElement('img');
    img.className = 'modal__image';
    img.src = `./${product.image}`;
    img.alt = product.title;

    const body = document.createElement('div');
    body.className = 'modal__body';
    body.innerHTML = `
        <div class="modal__title" data-test-id="modal-title">${product.title}</div>
        <div class="modal__type">${product.type}</div>
        <div class="modal__description" data-test-id="modal-description">${product.description}</div>
        <div class="modal__price" data-test-id="modal-price">${formatPrice(product.price)}</div>
    `;

    const actionBtn = document.createElement('button');
    actionBtn.className = 'btn btn--primary';
    actionBtn.type = 'button';

    function syncButton() {
        const inCart = isInCart(product.id);
        if (inCart) {
            actionBtn.textContent = 'Remove from cart';
            actionBtn.setAttribute('data-test-id', 'remove-from-cart');
        } else {
            actionBtn.textContent = 'Add to cart';
            actionBtn.setAttribute('data-test-id', 'add-to-cart');
        }
    }

    syncButton();

    actionBtn.addEventListener('click', async () => {
        const inCart = isInCart(product.id);
        actionBtn.disabled = true;

        if (!inCart) {
            addToCart(product);
            actionBtn.textContent = 'Added';
            showNotification('Great choice!');
            await sleep(2000);
        } else {
            removeFromCart(product.id);
            actionBtn.textContent = 'Removed';
            showNotification('Looking for something better?');
            await sleep(2000);
        }

        actionBtn.disabled = false;
        syncButton();
    });

    body.appendChild(actionBtn);

    modal.appendChild(closeBtn);
    modal.appendChild(img);
    modal.appendChild(body);
    overlay.appendChild(modal);

    root.innerHTML = '';
    root.appendChild(overlay);

    function onKeyDown(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', onKeyDown);
        }
    }

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', onKeyDown);
}

async function initShopPage() {
    const listEl = document.querySelector('[data-test-id="product-list"]');
    const filtersEl = document.getElementById('filters');
    const input = document.querySelector('[data-test-id="search-input"]');
    if (!listEl || !filtersEl || !input) return;

    renderSkeletons(listEl, 12);

    let products = [];
    try {
        products = await loadProducts();
        cachedProducts = products;
    } catch {
        listEl.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Failed to load products';
        listEl.parentNode.insertBefore(errorDiv, listEl);
        return;
    }

    const state = getQueryParams();
    input.value = state.search;
    renderFilters(filtersEl, state.filters);

    function rerender(nextState) {
        setQueryParams(nextState);
        renderFilters(filtersEl, nextState.filters);
        const filtered = filterProducts(products, nextState);
        renderProductList(listEl, filtered);
    }

    rerender(state);

    filtersEl.addEventListener('change', e => {
        const inputEl = e.target && e.target.closest('input[type="checkbox"]');
        if (!inputEl) return;
        const type = inputEl.value;
        const current = getQueryParams();
        const set = new Set(current.filters);
        if (inputEl.checked) set.add(type);
        else set.delete(type);
        rerender({search: current.search, filters: Array.from(set)});
    });

    initSearchSuggestions({
        getAllProducts: () => products,
        onEnterSearch: value => {
            const current = getQueryParams();
            rerender({search: value.trim(), filters: current.filters});
        },
        onPickSuggestion: ({id, title}) => {
            const next = {search: title, filters: []};
            input.value = title;
            rerender(next);
            const boughtIds = getBoughtProductIds();
            if (boughtIds.has(id)) return;
            const product = products.find(p => p.id === id);
            if (product) openProductModal(product);
        },
    });

    listEl.addEventListener('click', e => {
        const card = e.target && e.target.closest('[data-test-id="product-card"]');
        if (!card) return;
        const id = card.dataset.productId;
        const boughtIds = getBoughtProductIds();
        if (boughtIds.has(id)) return;
        const product = products.find(p => p.id === id);
        if (product) openProductModal(product);
    });
}

async function initGlobalSearch() {
    const input = document.querySelector('[data-test-id="search-input"]');
    if (!input) return;

    let products = [];
    try {
        products = await loadProducts();
        cachedProducts = products;
    } catch {
        return;
    }

    initSearchSuggestions({
        getAllProducts: () => products,
        onEnterSearch: value => {
            const url = new URL('./', window.location.href);
            if (value.trim()) url.searchParams.set('search', value.trim());
            window.location.href = url.toString();
        },
        onPickSuggestion: ({id, title}) => {
            input.value = title;
            const boughtIds = getBoughtProductIds();
            if (!boughtIds.has(id)) {
                const product = products.find(p => p.id === id);
                if (product) openProductModal(product);
            }
            const url = new URL('./', window.location.href);
            url.searchParams.set('search', title);
            window.location.href = url.toString();
        },
    });
}

function renderCartPage() {
    const list = document.querySelector('[data-test-id="cart-list"]');
    if (!list) return;

    const cart = getCartItems();
    if (!cart.length) {
        list.innerHTML = `<div class="cart-empty" data-test-id="cart-empty">Cart is empty</div>`;
        return;
    }

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'cart-items';

    for (const item of cart) {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.setAttribute('data-test-id', 'cart-item');
        row.dataset.productId = item.id;
        row.innerHTML = `
            <img class="cart-item__img" src="./${item.image}" alt="${item.title}" />
            <div class="cart-item__info">
                <div class="cart-item__title" data-test-id="cart-item-title">${item.title}</div>
                <div class="cart-item__price" data-test-id="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <button class="btn" type="button" data-test-id="cart-remove">Remove</button>
        `;
        itemsWrap.appendChild(row);
    }

    const total = cart.reduce((sum, p) => sum + (p && p.price ? p.price : 0), 0);

    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    summary.innerHTML = `
        <div class="cart-total" data-test-id="cart-total">Total: ${formatPrice(total)}</div>
        <div class="cart-actions" id="cart-actions"></div>
    `;

    list.innerHTML = '';
    list.appendChild(itemsWrap);
    list.appendChild(summary);

    const actions = summary.querySelector('#cart-actions');
    const profile = readStorage(STORAGE_KEYS.PROFILE, null);
    const isAuthed = profile && profile.name && profile.email;

    if (!isAuthed) {
        const loginBtn = document.createElement('button');
        loginBtn.className = 'btn';
        loginBtn.type = 'button';
        loginBtn.textContent = 'Login to place an order';
        loginBtn.addEventListener('click', () => navigateTo('./profile.html'));
        actions.appendChild(loginBtn);
    } else {
        const checkoutBtn = document.createElement('button');
        checkoutBtn.className = 'btn btn--primary';
        checkoutBtn.type = 'button';
        checkoutBtn.textContent = 'Place Order';
        checkoutBtn.setAttribute('data-test-id', 'checkout-button');

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn';
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.setAttribute('data-test-id', 'cancel-checkout-button');
        cancelBtn.style.display = 'none';

        actions.appendChild(checkoutBtn);
        actions.appendChild(cancelBtn);

        let checkoutTimer = null;

        function resetCheckoutUI() {
            checkoutBtn.disabled = false;
            cancelBtn.style.display = 'none';
            if (checkoutTimer) window.clearTimeout(checkoutTimer);
            checkoutTimer = null;
        }

        checkoutBtn.addEventListener('click', () => {
            const orderTimestamp = Date.now();
            checkoutBtn.disabled = true;
            cancelBtn.style.display = '';

            checkoutTimer = window.setTimeout(() => {
                const order = {
                    id: `ORD-${orderTimestamp}`,
                    date: formatDate(orderTimestamp),
                    products: cart,
                    total,
                };
                const orders = readStorage(STORAGE_KEYS.ORDERS, []);
                const next = Array.isArray(orders) ? [order, ...orders] : [order];
                writeStorage(STORAGE_KEYS.ORDERS, next);
                setCartItems([]);
                navigateTo('./history.html');
            }, 1500);
        });

        cancelBtn.addEventListener('click', () => {
            resetCheckoutUI();
        });
    }

    list.addEventListener('click', e => {
        const btn = e.target && e.target.closest('[data-test-id="cart-remove"]');
        if (!btn) return;
        const row = btn.closest('[data-test-id="cart-item"]');
        if (!row) return;
        const id = row.dataset.productId;
        openRemoveConfirmModal(id);
    });
}

function openRemoveConfirmModal(productId) {
    const root = document.getElementById('modal-root');
    if (!root) return;
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.setAttribute('data-test-id', 'remove-confirm-modal');
    modal.innerHTML = `
        <div class="confirm-modal__title">Remove Product?</div>
        <div class="confirm-modal__text">Are you sure you want to remove this product from your cart?</div>
        <div class="confirm-modal__actions">
            <button class="btn btn--primary" type="button" data-test-id="confirm-remove">Yes, remove</button>
            <button class="btn" type="button" data-test-id="cancel-remove">Cancel</button>
        </div>
    `;

    overlay.appendChild(modal);
    root.innerHTML = '';
    root.appendChild(overlay);

    const confirmBtn = modal.querySelector('[data-test-id="confirm-remove"]');
    const cancelBtn = modal.querySelector('[data-test-id="cancel-remove"]');

    function close() {
        root.innerHTML = '';
    }

    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (confirmBtn)
        confirmBtn.addEventListener('click', () => {
            removeFromCart(productId);
            close();
            showNotification('Looking for something better?');
            renderCartPage();
        });
}

function renderProfilePage() {
    const container = document.querySelector('[data-test-id="profile"]');
    if (!container) return;

    const saved = readStorage(STORAGE_KEYS.PROFILE, {name: '', email: '', notifications: false});

    container.innerHTML = `
        <div class="profile">
            <div class="profile__title">My Profile</div>
            <div class="profile__field">
                <label class="profile__label" for="profile-name">Name</label>
                <input id="profile-name" class="profile__input" data-test-id="profile-name" />
                <div class="profile__error" data-error-for="name"></div>
            </div>
            <div class="profile__field">
                <label class="profile__label" for="profile-email">E-mail</label>
                <input id="profile-email" class="profile__input" data-test-id="profile-email" />
                <div class="profile__error" data-error-for="email"></div>
            </div>
            <label class="profile__checkbox-row" data-test-id="profile-notifications">
                <span class="profile__checkbox-box"><span class="profile__checkbox-check"></span></span>
                <input type="checkbox" class="profile__checkbox-input" />
                <span>Receive notifications about new products</span>
            </label>
            <button class="btn btn--primary profile__save" type="button" data-test-id="profile-save">Save</button>
        </div>
    `;

    const nameInput = container.querySelector('[data-test-id="profile-name"]');
    const emailInput = container.querySelector('[data-test-id="profile-email"]');
    const notifContainer = container.querySelector('[data-test-id="profile-notifications"]');
    const notifInput = notifContainer && notifContainer.querySelector('.profile__checkbox-input');
    const notifBox = notifContainer && notifContainer.querySelector('.profile__checkbox-box');
    const saveBtn = container.querySelector('[data-test-id="profile-save"]');

    if (nameInput) nameInput.value = saved.name || '';
    if (emailInput) emailInput.value = saved.email || '';
    if (notifInput) notifInput.checked = !!saved.notifications;
    if (notifBox && saved.notifications) notifBox.classList.add('profile__checkbox-box--checked');

    if (notifInput && notifBox) {
        notifInput.addEventListener('change', () => {
            if (notifInput.checked) {
                notifBox.classList.add('profile__checkbox-box--checked');
            } else {
                notifBox.classList.remove('profile__checkbox-box--checked');
            }
        });
    }

    function setError(field, msg) {
        const el = container.querySelector(`[data-error-for="${field}"]`);
        if (el) el.textContent = msg || '';
    }

    function validate() {
        const name = (nameInput && nameInput.value.trim()) || '';
        const email = (emailInput && emailInput.value.trim()) || '';
        let valid = true;

        setError('name', '');
        setError('email', '');

        if (!name) {
            setError('name', 'Name is required');
            valid = false;
        }

        if (!email) {
            setError('email', 'E-mail is required');
            valid = false;
        } else {
            const atCount = (email.match(/@/g) || []).length;
            if (atCount !== 1) {
                setError('email', 'E-mail must contain exactly one @ symbol');
                valid = false;
            } else {
                const afterAt = email.split('@')[1] || '';
                const dotCount = (afterAt.match(/\./g) || []).length;
                if (dotCount > 1) {
                    setError('email', 'E-mail must contain exactly one dot after @');
                    valid = false;
                }
            }
        }

        return {valid, name, email};
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const {valid, name, email} = validate();
            if (!valid) return;

            const profile = {
                name,
                email,
                notifications: notifInput ? notifInput.checked : false,
            };
            writeStorage(STORAGE_KEYS.PROFILE, profile);
            showNotification('Data saved');
        });
    }
}

function parseDate(dateStr) {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return 0;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day).getTime();
}

function renderHistoryPage() {
    const container = document.querySelector('[data-test-id="orders-list"]');
    if (!container) return;

    const orders = readStorage(STORAGE_KEYS.ORDERS, []);
    if (!orders || !orders.length) {
        container.innerHTML = `<div class="orders-empty" data-test-id="orders-empty">Order history is empty</div>`;
        return;
    }

    const sortedOrders = [...orders].sort((a, b) => parseDate(a.date) - parseDate(b.date));

    const wrap = document.createElement('div');
    wrap.className = 'orders';

    for (const order of sortedOrders) {
        const item = document.createElement('div');
        item.className = 'orders__item';
        item.setAttribute('data-test-id', 'orders-item');

        const total = typeof order.total === 'number' ? formatPrice(order.total) : '';

        const products = Array.isArray(order.products) ? order.products : [];
        const productsHtml = products.map(p => `<span class="orders__tag">${p.title}</span>`).join('');

        item.innerHTML = `
            <div class="orders__header">
                <div class="orders__id">Order ${order.id}</div>
                <div class="orders__date">${order.date}</div>
            </div>
            <div class="orders__products">${productsHtml}</div>
            <div class="orders__total">Total: ${total}</div>
        `;

        wrap.appendChild(item);
    }

    container.innerHTML = '';
    container.appendChild(wrap);
}

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
