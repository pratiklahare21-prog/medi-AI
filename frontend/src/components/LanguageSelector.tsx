import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('medi-ai-language', languageCode);
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#334155] text-slate-200 transition-colors text-xs font-medium"
        title={t('header.language_selector')}
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="material-symbols-outlined text-sm text-[#94A3B8]">
          {dropdownOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1E293B] border border-[#334155] rounded-lg shadow-2xl p-1.5 z-50">
          <div className="px-2 py-1 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider border-b border-[#334155] mb-1">
            {t('header.language_selector')}
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors text-xs ${
                lang.code === i18n.language
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'text-slate-200 hover:bg-[#334155]'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-[10px] opacity-75">{lang.name}</span>
              </div>
              {lang.code === i18n.language && (
                <span className="material-symbols-outlined text-sm ml-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
