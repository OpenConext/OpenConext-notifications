import { I18n as I18nRemote } from 'i18n-js';
import Cookies from 'js-cookie';

import en from './en';
import nl from './nl';

const translations = { en, nl };

export const AVAILABLE_LANGUAGES = Object.keys(translations);

const getPreferredLanguage = (): string => {
    const fromParameter =
        typeof window === 'undefined'
            ? null
            : new URLSearchParams(window.location.search).get('lang');
    const fromBrowser =
        typeof navigator === 'undefined'
            ? ''
            : navigator.language.toLowerCase().substring(0, 2);
    const preferred = fromParameter ?? Cookies.get('lang') ?? fromBrowser;
    return AVAILABLE_LANGUAGES.includes(preferred) ? preferred : 'en';
};

export const I18n = new I18nRemote(translations, {
    defaultLocale: 'en',
    locale: getPreferredLanguage(),
    enableFallback: true,
});

export const switchLocale = (locale: string) => {
    Cookies.set('lang', locale, { expires: 365, sameSite: 'strict' });
    I18n.locale = locale;
    // the lang parameter wins over the cookie on load, so the reload that follows picks it up
    const url = new URL(window.location.href);
    url.searchParams.set('lang', locale);
    window.history.replaceState(window.history.state, '', url);
};

export default I18n;
