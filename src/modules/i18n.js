// i18n.ts
import i18n from "i18next";
import {initReactI18next} from "react-i18next";

const LS_LANG_KEY = "lang";
const LS_RES_PREFIX = "i18n-";

export function readLang() {
  try {
    return window?.localStorage?.getItem(LS_LANG_KEY) || "ko";
  } catch {
    return "ko";
  }
}

export function readRes(lng) {
  try {
    const raw = window?.localStorage?.getItem(`${LS_RES_PREFIX}${lng}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialLng = readLang();
const initialRes = readRes(initialLng);
const resources = initialRes ? {[initialLng]: {translation: initialRes}} : {};

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: "ko",
  interpolation: {escapeValue: false},
});

export async function setLanguage(lng) {
  try {
    window?.localStorage?.setItem(LS_LANG_KEY, lng);
  } catch {}
  const res = readRes(lng);
  if (res) {
    i18n.addResources(lng, "translation", res);
  }
  await i18n.changeLanguage(lng);
}

export function loadResources(lng, resObj) {
  try {
    window?.localStorage?.setItem(
      `${LS_RES_PREFIX}${lng}`,
      JSON.stringify(resObj)
    );
  } catch {}
  i18n.addResources(lng, "translation", resObj);
}

// (선택) 다른 탭/창에서 lang 변경 시 동기화
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === LS_LANG_KEY && e.newValue) {
      setLanguage(e.newValue);
    }
    if (e.key?.startsWith(LS_RES_PREFIX)) {
      const lng = e.key.replace(LS_RES_PREFIX, "");
      const res = readRes(lng);
      if (res) i18n.addResources(lng, "translation", res);
    }
  });
}

export default i18n;
