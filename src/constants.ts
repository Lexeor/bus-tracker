// localStorage key for visible routes
export const VISIBLE_ROUTES_KEY = 'busapp-visible-routes';
// Temporary center at Herceg Novi
export const defaultCenter: [number, number] = [42.453, 18.531];

export const DISCLAIMER_STORAGE_KEY = 'busapp-disclaimer-seen';

export const SHOW_DISCLAIMER_STORAGE_KEY = 'busapp-disclaimer-show';

export const LANGUAGE_KEY = 'busapp-lang';

export const FIRST_LANGUAGE_SELECTED_STORAGE_KEY = 'busapp-first-language-selected';

export const FOCUS_ON_ROUTES_KEY = 'busapp-focus-on-routes';

export const DARK_MODE_KEY = 'busapp-dark-mode';

export const lightTileLayer = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const darkTileLayer = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};
