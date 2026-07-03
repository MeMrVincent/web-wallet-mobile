import { createI18n } from 'vue-i18n';

const messages = {
  'en-us': require('./en-us.json'),
  'zh-cn': require('./zh-cn.json'),
  'ja-jp': require('./ja-jp.json'),
};

const normalizeLocale = (locale) => String(locale || '').toLowerCase().replace('_', '-');
const configuredLanguages = String(process.env.lanKeys || 'en-us,zh-cn,ja-jp')
  .split(',')
  .map((item) => normalizeLocale(item.trim()))
  .filter(Boolean);
const supportedLanguages = configuredLanguages.length ? configuredLanguages : Object.keys(messages);
const defaultLanguage = normalizeLocale(process.env.defaultLanguage) || supportedLanguages[0] || 'en-us';

const pickSupportedLocale = (locale) => {
  const normalized = normalizeLocale(locale);
  if (!normalized) return '';
  if (messages[normalized] && supportedLanguages.includes(normalized)) return normalized;
  return supportedLanguages.find((item) => normalized === item || normalized.startsWith(item) || item.startsWith(normalized.split('-')[0])) || '';
};

export const getLocale = () => {
  const params = new URLSearchParams(window.location.search || '');
  const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
  const hashParams = new URLSearchParams(hashQuery);
  const queryLocale = pickSupportedLocale(params.get('lang') || params.get('language') || hashParams.get('lang') || hashParams.get('language'));
  if (queryLocale) {
    localStorage.setItem('language', queryLocale);
    localStorage.setItem('languageSelected', '1');
    return queryLocale;
  }

  const hasSelectedLanguage = localStorage.getItem('languageSelected') === '1';
  const storeLocale = hasSelectedLanguage ? pickSupportedLocale(localStorage.getItem('language')) : '';
  if (storeLocale) return storeLocale;

  const fallback = pickSupportedLocale(defaultLanguage) || 'en-us';
  localStorage.setItem('language', fallback);
  return fallback;
};

export const setLocale = (i18n, locale) => {
  const nextLocale = pickSupportedLocale(locale) || pickSupportedLocale(defaultLanguage) || 'en-us';
  i18n.global.locale.value = nextLocale;
  localStorage.setItem('language', nextLocale);
  localStorage.setItem('languageSelected', '1');
  document.documentElement.setAttribute('lang', nextLocale);
  return nextLocale;
};

export const languageOptions = supportedLanguages
  .filter((item) => messages[item])
  .map((value) => {
    const text = messages[value].language.nativeName;
    return { value, text, label: text };
  });

const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: getLocale(),
  fallbackLocale: pickSupportedLocale(defaultLanguage) || 'en-us',
  messages,
});

document.documentElement.setAttribute('lang', i18n.global.locale.value);

export default i18n;
