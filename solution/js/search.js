import { loadProducts } from './products.js';
import { getBoughtProductIds } from './products.js';
import { openProductModal } from './modal.js';

export function initSearchSuggestions({getAllProducts, onPickSuggestion, onEnterSearch}) {
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

export async function initGlobalSearch() {
    const input = document.querySelector('[data-test-id="search-input"]');
    if (!input) return;

    let products = [];
    try {
        products = await loadProducts();
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
