"use client";
import {useEffect} from "react";
import {setLanguage, loadResources} from "@/modules/i18n";

const LanguageProvider = ({children}) => {
  const url = import.meta.env?.VITE_PUBLIC_API_URL || "http://localhost:9000";
  const lng =
    typeof window !== "undefined"
      ? window?.localStorage?.getItem("lang") || "ko"
      : "ko";
  useEffect(() => {
    (async () => {
      const fetchLangData = await fetch(`${url}/api/language/ko`);
      const langResource = await fetchLangData.json();
      Object.entries(langResource).map(([lang, value]) => {
        loadResources(lang, value);
      });
      setLanguage(lng);
    })();
  }, []);
  return <>{children}</>;
};

export default LanguageProvider;
