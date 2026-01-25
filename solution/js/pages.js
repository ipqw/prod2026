import { readStorage, writeStorage, STORAGE_KEYS } from './storage.js';
import { showNotification, formatPrice, formatDate } from './utils.js';
import { getCartItems, setCartItems, removeFromCart } from './cart.js';
import { navigateTo } from './navigation.js';
import { loadProducts, renderSkeletons, renderProductList, renderFilters, filterProducts, getQueryParams, setQueryParams, getBoughtProductIds } from './products.js';
import { initSearchSuggestions } from './search.js';
import { openProductModal, openRemoveConfirmModal } from './modal.js';

export async function initShopPage() {
    const listEl = document.querySelector('[data-test-id="product-list"]');
    const filtersEl = document.getElementById('filters');
    const input = document.querySelector('[data-test-id="search-input"]');
    if (!listEl || !filtersEl || !input) return;

    renderSkeletons(listEl, 12);

    let products = [];
    try {
        products = await loadProducts();
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

export function renderCartPage() {
    const list = document.querySelector('[data-test-id="cart-list"]');
    if (!list) return;

    const cart = getCartItems();
    if (!cart.length) {
        list.innerHTML = `<h1 class="page__title">Shopping Cart</h1><div class="cart-empty" data-test-id="cart-empty">Cart is empty</div>`;
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
            <button class="cart-item__remove-button" type="button" data-test-id="cart-remove">Remove</button>
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

    const heading = document.createElement('h1');
    heading.className = 'page__title';
    heading.textContent = 'Shopping Cart';

    list.innerHTML = '';
    list.appendChild(heading);
    list.appendChild(itemsWrap);
    list.appendChild(summary);

    const actions = summary.querySelector('#cart-actions');
    const profile = readStorage(STORAGE_KEYS.PROFILE, null);
    const isAuthed = profile && profile.name && profile.email;

    if (!isAuthed) {
        const loginBtn = document.createElement('button');
        loginBtn.className = 'login-btn';
        loginBtn.type = 'button';
        loginBtn.textContent = 'Login to place an order';
        loginBtn.addEventListener('click', () => navigateTo('./profile.html'));
        actions.appendChild(loginBtn);
    } else {
        const checkoutBtn = document.createElement('button');
        checkoutBtn.className = 'cart-actions__place-button ';
        checkoutBtn.type = 'button';
        checkoutBtn.textContent = 'Place Order';
        checkoutBtn.setAttribute('data-test-id', 'checkout-button');

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cart-actions__cancel-button';
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
        openRemoveConfirmModal(id, () => {
            removeFromCart(id);
            showNotification('Looking for something better?');
            renderCartPage();
        });
    });
}

export function renderProfilePage() {
    const container = document.querySelector('.page__content');
    if (!container) return;

    const saved = readStorage(STORAGE_KEYS.PROFILE, {name: '', email: '', notifications: false});

    container.innerHTML = `
        <div class="profile" data-test-id="profile">
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
            <label class="profile__checkbox-row" id="notif-checkbox" data-test-id="profile-notifications">
                <span class="profile__checkbox-box"><span class="profile__checkbox-check"></span></span>
                <input type="checkbox" class="profile__checkbox-input" />
                <span class="profile__checkbox-span">Receive notifications about new products</span>
            </label>
            <button class="profile__save" type="button" data-test-id="profile-save">Save</button>
        </div>
    `;

    const nameInput = container.querySelector('[data-test-id="profile-name"]');
    const emailInput = container.querySelector('[data-test-id="profile-email"]');
    const notifContainer = container.querySelector('[data-test-id="profile-notifications"]');
    const notifInput = notifContainer && notifContainer.querySelector('.profile__checkbox-input');
    const notifBox = notifContainer && notifContainer.querySelector('.profile__checkbox-box');
    const saveBtn = container.querySelector('[data-test-id="profile-save"]');

    const notifCheckbox = document.getElementById('notif-checkbox')

    notifCheckbox.addEventListener('mouseenter', () => {
        notifBox.classList.add('profile__checkbox-box--hover')
    })

    notifCheckbox.addEventListener('mouseleave', () => {
        notifBox.classList.remove('profile__checkbox-box--hover')
    })

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

export function renderHistoryPage() {
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
