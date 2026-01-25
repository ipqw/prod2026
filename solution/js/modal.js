import { isInCart, addToCart, removeFromCart } from './cart.js';
import { formatPrice } from './utils.js';
import { showNotification, sleep } from './utils.js';

export function closeModal() {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = '';
}

export function openProductModal(product) {
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
    actionBtn.className = 'btn btn--primary btn__add-to-cart';
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

export function openRemoveConfirmModal(productId, onConfirm) {
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
            <button class="btn btn--primary confirm-modal__remove-btn" type="button" data-test-id="confirm-remove">Yes, remove</button>
            <button class="btn confirm-modal__cancel-btn" type="button" data-test-id="cancel-remove">Cancel</button>
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
            close();
            if (onConfirm) onConfirm();
        });
}
