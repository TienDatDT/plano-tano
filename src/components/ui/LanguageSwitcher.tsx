"use client";

import i18n from "@/lib/i18n";

export default function LanguageSwitcher() {
  const changeLanguage = (lang: "en" | "vi") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div>
      <button onClick={() => changeLanguage("en")}>
        English
      </button>

      <button onClick={() => changeLanguage("vi")}>
        Tiếng Việt
      </button>
    </div>
  );
}