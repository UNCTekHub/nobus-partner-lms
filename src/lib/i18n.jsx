import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.catalog': 'Course Catalog',
    'nav.certification': 'Certifications',
    'nav.discussions': 'Discussions',
    'nav.leaderboard': 'Leaderboard',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin Console',
    'nav.orgAdmin': 'My Organization',
    'nav.logout': 'Sign Out',
    // Auth
    'auth.login': 'Sign In',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.register': 'Register your organization as a Nobus partner',
    'auth.resetPassword': 'Reset Password',
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.continueLearning': 'Continue Learning',
    'dashboard.recommendations': 'Recommended for You',
    'dashboard.recentActivity': 'Recent Activity',
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search...',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.noResults': 'No results found',
    'common.viewAll': 'View All',
  },
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.catalog': 'Catalogue de cours',
    'nav.certification': 'Certifications',
    'nav.discussions': 'Discussions',
    'nav.leaderboard': 'Classement',
    'nav.profile': 'Profil',
    'nav.admin': 'Console Admin',
    'nav.orgAdmin': 'Mon Organisation',
    'nav.logout': 'Déconnexion',
    'auth.login': 'Se connecter',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié ?',
    'auth.register': 'Enregistrez votre organisation en tant que partenaire Nobus',
    'auth.resetPassword': 'Réinitialiser le mot de passe',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.continueLearning': 'Continuer l\'apprentissage',
    'dashboard.recommendations': 'Recommandé pour vous',
    'dashboard.recentActivity': 'Activité récente',
    'common.loading': 'Chargement...',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher...',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.noResults': 'Aucun résultat trouvé',
    'common.viewAll': 'Voir tout',
  },
  ha: {
    'nav.dashboard': 'Dashboard',
    'nav.catalog': 'Jerin Darussa',
    'nav.certification': 'Takaddun shaida',
    'nav.discussions': 'Tattaunawa',
    'nav.leaderboard': 'Jadawalin Jagora',
    'nav.profile': 'Bayanan Martaba',
    'nav.admin': 'Kwamitin Gudanarwa',
    'nav.logout': 'Fita',
    'auth.login': 'Shiga',
    'auth.email': 'Imel',
    'auth.password': 'Kalmar sirri',
    'common.loading': 'Ana lodawa...',
    'common.save': 'Ajiye',
    'common.cancel': 'Soke',
    'common.search': 'Bincika...',
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('nobus-lms-locale') || 'en');

  const changeLocale = useCallback((newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('nobus-lms-locale', newLocale);
  }, []);

  const t = useCallback((key) => {
    return translations[locale]?.[key] || translations.en?.[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t, availableLocales: Object.keys(translations) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
