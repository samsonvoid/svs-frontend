import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

/**
 * LanguageProvider — wrap your app with this to enable EN/SW switching.
 * Language preference is persisted in localStorage so it survives page refreshes.
 */
export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('svs_lang') || 'en';
    });

    const toggleLang = useCallback(() => {
        setLang(prev => {
            const next = prev === 'en' ? 'sw' : 'en';
            localStorage.setItem('svs_lang', next);
            return next;
        });
    }, []);

    /**
     * t(key, vars?) — translate a key into the active language.
     * Supports simple variable interpolation: t('kpi_today_sales_sub', { n: 3 })
     * will replace {n} in the string with 3.
     */
    const t = useCallback((key, vars = {}) => {
        const entry = translations[key];
        if (!entry) return key; // fallback: show key if missing
        let text = entry[lang] ?? entry['en'] ?? key;
        // Replace {varName} placeholders
        Object.entries(vars).forEach(([k, v]) => {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        });
        return text;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * useLanguage() — consume translation context in any component.
 * Returns { lang, toggleLang, t }
 */
export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
    return ctx;
};
