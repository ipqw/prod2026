import { STORAGE_KEYS } from './storage.js';

export function applyThemeFromStorage() {
    const saved = localStorage.getItem('theme');
    const html = document.documentElement;
    const toggle = document.querySelector('[data-test-id="theme-toggle"]');
    const toggleIcon = toggle && toggle.querySelector('img');
    if (saved === 'dark') {
        html.classList.add('dark-theme');
        if (toggleIcon) toggleIcon.src = './images/icons/sun.svg';
    } else {
        html.classList.remove('dark-theme');
        if (toggleIcon) toggleIcon.src = './images/icons/moon.svg';
    }
}

export function initThemeToggle() {
    applyThemeFromStorage();
    const toggle = document.querySelector('[data-test-id="theme-toggle"]');
    const icon = toggle && toggle.querySelector('img');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark-theme');
        localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        if (icon) {
            icon.src = isDark ? './images/icons/sun.svg' : './images/icons/moon.svg';
        }
    });
}
