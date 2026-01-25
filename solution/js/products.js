import { readStorage, writeStorage, STORAGE_KEYS } from './storage.js';
import { formatPrice } from './utils.js';

export function getQueryParams() {
    const url = new URL(window.location.href);
    const search = url.searchParams.get('search') || '';
    const filtersRaw = url.searchParams.get('filters') || '';
    const filters = filtersRaw
        ? filtersRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    return {search, filters};
}

export function setQueryParams({search, filters}) {
    const url = new URL(window.location.href);
    if (search) url.searchParams.set('search', search);
    else url.searchParams.delete('search');

    if (filters && filters.length) url.searchParams.set('filters', filters.join(','));
    else url.searchParams.delete('filters');

    window.history.replaceState({}, '', url.toString());
}

export async function loadProducts() {
    const cached = readStorage(STORAGE_KEYS.PRODUCTS, null);
    if (cached && Array.isArray(cached) && cached.length) return cached;

    const res = await fetch('./data.json', {cache: 'no-store'});
    const json = await res.json();
    const products = json && Array.isArray(json.products) ? json.products : null;
    if (!products) throw new Error('Invalid products');
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    return products;
}

export function renderSkeletons(container, count) {
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

export function getBoughtProductIds() {
    const orders = readStorage(STORAGE_KEYS.ORDERS, []);
    const ids = new Set();
    if (!Array.isArray(orders)) return ids;
    for (const order of orders) {
        const products = order && Array.isArray(order.products) ? order.products : [];
        for (const p of products) if (p && p.id) ids.add(p.id);
    }
    return ids;
}

export function filterProducts(products, {search, filters}) {
    const s = (search || '').trim().toLowerCase();
    const fset = new Set((filters || []).map(x => String(x)));
    return products.filter(p => {
        const okFilter = fset.size ? fset.has(p.type) : true;
        const okSearch = s ? String(p.title || '').toLowerCase().includes(s) : true;
        return okFilter && okSearch;
    });
}

export function renderProductList(container, products) {
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
                ${isBought ? '<div class="product-card__bought-bg"><div class="product-card__bought-badge">BOUGHT</div></div>' : ''}
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

export function renderFilters(container, selected) {
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
        text.className = 'filter__text'
        text.textContent = t;

        label.appendChild(input);
        label.appendChild(box);
        label.appendChild(text);
        container.appendChild(label);
    }
}
