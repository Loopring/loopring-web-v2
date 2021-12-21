import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "./en_US";
// import zhCN from './zh_CN'
// import { localStore } from '../storage';
// the translations
// (tip move them in a JSON file and import them)
export enum LanguageType {
  en_US = "en_US",
  zh_CN = "zh_CN",
}

export type LanguageKeys = keyof typeof LanguageType;

export const resources = {
  en_US: { ...enUS },
  // zh_CN: {...zhCN},
};

// const initLng = JSON.parse(localStorage.getItem('persist:settings') as string)?.language === `"${LanguageType.zh_CN}"` ? LanguageType.zh_CN : LanguageType.en_US

const initLng = LanguageType.en_US;

i18n.use(initReactI18next).init({
  resources,
  ns: ["common", "layout", "tables", "landPage", "error"],
  defaultNS: "common",
  lng: initLng,
  load: "currentOnly",
  fallbackLng: LanguageType.en_US,
  // supportedLngs: [LanguageType.en_US, LanguageType.zh_CN],
  keySeparator: false, // we do not use keys in form messages.welcome
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  // debug:true,
  react: {
    bindI18n: "languageChanged",
    // bindI18nStore: '',
    transEmptyNodeValue: "",
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ["br", "strong", "i"],
    useSuspense: true,
  },
});
export default i18n;
