export function showNotification(message) {
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

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatPrice(price) {
    try {
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(price);
    } catch {
        return `$${price}`;
    }
}

export function formatDate(timestamp) {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}
