/**
 * ==============================================
 * VARLIXO - INTERNATIONALIZATION (i18n)
 * ==============================================
 * Multi-language support for the platform
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ar' | 'pt' | 'ru';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const languages: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
];

// Translation strings
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.plans': 'Investment Plans',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',

    // Hero Section
    'hero.badge': 'Trusted by 50,000+ investors worldwide',
    'hero.title': 'Your Wealth,',
    'hero.titleHighlight': 'Amplified.',
    'hero.subtitle': 'Join the elite investors earning up to 3% daily returns with our AI-powered trading platform. Secure, transparent, and built for growth.',
    'hero.cta': 'Start Investing Now',
    'hero.secondary': 'View Plans',

    // Stats
    'stats.totalVolume': 'Total Volume',
    'stats.activeInvestors': 'Active Investors',
    'stats.uptime': 'Platform Uptime',
    'stats.support': 'Expert Support',

    // Features
    'features.title': 'Built for Modern Investors',
    'features.subtitle': 'Experience the difference with our cutting-edge investment platform designed for maximum returns.',

    // Plans
    'plans.title': 'Choose Your Growth Path',
    'plans.subtitle': 'Flexible plans designed for every investor. Start small, think big.',
    'plans.daily': '/day',
    'plans.duration': 'days',
    'plans.minInvestment': 'Min Investment',
    'plans.maxInvestment': 'Max Investment',
    'plans.totalReturn': 'Total Return',
    'plans.getStarted': 'Get Started',
    'plans.popular': 'MOST POPULAR',

    // Calculator
    'calculator.title': 'Calculate Your Potential Earnings',
    'calculator.selectPlan': 'Select Plan',
    'calculator.amount': 'Investment Amount',
    'calculator.dailyProfit': 'Daily Profit',
    'calculator.weeklyProfit': 'Weekly Profit',
    'calculator.totalProfit': 'Total Profit',
    'calculator.totalReturn': 'Total Return',

    // Testimonials
    'testimonials.title': 'Trusted by Thousands',
    'testimonials.subtitle': 'Real stories from real investors who transformed their financial future with Varlixo.',

    // CTA
    'cta.title': 'Ready to Start Growing Your Wealth?',
    'cta.subtitle': 'Join over 50,000 investors earning daily returns with Varlixo.',
    'cta.button': 'Create Free Account',

    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.rememberMe': 'Remember me',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.createAccount': 'Create account',
    'auth.signIn': 'Sign in',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': "Here's your portfolio overview",
    'dashboard.totalBalance': 'Total Balance',
    'dashboard.totalProfit': 'Total Profit',
    'dashboard.invested': 'Invested',
    'dashboard.referralEarnings': 'Referral Earnings',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.deposit': 'Deposit',
    'dashboard.withdraw': 'Withdraw',
    'dashboard.invest': 'Invest',
    'dashboard.referral': 'Referral',

    // Footer
    'footer.description': 'The future of intelligent investing. Secure, scalable, and built for growth.',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.rights': 'All rights reserved.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.viewAll': 'View All',
    'common.learnMore': 'Learn More',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.about': 'Nosotros',
    'nav.plans': 'Planes de Inversión',
    'nav.faq': 'Preguntas',
    'nav.contact': 'Contacto',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Comenzar',
    'nav.dashboard': 'Panel',
    'nav.logout': 'Cerrar Sesión',

    // Hero Section
    'hero.badge': 'Confiado por más de 50,000 inversores en todo el mundo',
    'hero.title': 'Tu Riqueza,',
    'hero.titleHighlight': 'Amplificada.',
    'hero.subtitle': 'Únete a los inversores de élite que ganan hasta un 3% de rendimiento diario con nuestra plataforma impulsada por IA.',
    'hero.cta': 'Comenzar a Invertir',
    'hero.secondary': 'Ver Planes',

    // Stats
    'stats.totalVolume': 'Volumen Total',
    'stats.activeInvestors': 'Inversores Activos',
    'stats.uptime': 'Tiempo Activo',
    'stats.support': 'Soporte Experto',

    // Plans
    'plans.title': 'Elige Tu Camino de Crecimiento',
    'plans.subtitle': 'Planes flexibles diseñados para cada inversor.',
    'plans.daily': '/día',
    'plans.duration': 'días',
    'plans.minInvestment': 'Inversión Mínima',
    'plans.maxInvestment': 'Inversión Máxima',
    'plans.totalReturn': 'Retorno Total',
    'plans.getStarted': 'Comenzar',
    'plans.popular': 'MÁS POPULAR',

    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Crear Cuenta',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',

    // Dashboard
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.totalBalance': 'Balance Total',
    'dashboard.totalProfit': 'Ganancia Total',

    // Common
    'common.loading': 'Cargando...',
    'common.success': '¡Éxito!',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.plans': "Plans d'Investissement",
    'nav.login': 'Connexion',
    'nav.register': 'Commencer',
    'hero.badge': 'Fait confiance par plus de 50 000 investisseurs',
    'hero.title': 'Votre Richesse,',
    'hero.titleHighlight': 'Amplifiée.',
    'hero.cta': 'Commencer à Investir',
    'plans.title': 'Choisissez Votre Voie de Croissance',
    'auth.login': 'Se Connecter',
    'auth.register': 'Créer un Compte',
    'dashboard.welcome': 'Bienvenue',
    'common.loading': 'Chargement...',
  },

  de: {
    'nav.home': 'Startseite',
    'nav.about': 'Über Uns',
    'nav.plans': 'Investitionspläne',
    'nav.login': 'Anmelden',
    'nav.register': 'Loslegen',
    'hero.badge': 'Vertraut von über 50.000 Investoren weltweit',
    'hero.title': 'Ihr Vermögen,',
    'hero.titleHighlight': 'Verstärkt.',
    'hero.cta': 'Jetzt Investieren',
    'plans.title': 'Wählen Sie Ihren Wachstumspfad',
    'auth.login': 'Anmelden',
    'auth.register': 'Konto Erstellen',
    'dashboard.welcome': 'Willkommen zurück',
    'common.loading': 'Laden...',
  },

  zh: {
    'nav.home': '首页',
    'nav.about': '关于我们',
    'nav.plans': '投资计划',
    'nav.login': '登录',
    'nav.register': '开始',
    'hero.badge': '全球超过50,000名投资者信赖',
    'hero.title': '您的财富，',
    'hero.titleHighlight': '放大。',
    'hero.cta': '立即开始投资',
    'plans.title': '选择您的成长路径',
    'auth.login': '登录',
    'auth.register': '创建账户',
    'dashboard.welcome': '欢迎回来',
    'common.loading': '加载中...',
  },

  ar: {
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.plans': 'خطط الاستثمار',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'ابدأ الآن',
    'hero.badge': 'موثوق به من قبل أكثر من 50,000 مستثمر',
    'hero.title': 'ثروتك،',
    'hero.titleHighlight': 'مضاعفة.',
    'hero.cta': 'ابدأ الاستثمار الآن',
    'plans.title': 'اختر مسار نموك',
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
    'dashboard.welcome': 'مرحباً بعودتك',
    'common.loading': 'جاري التحميل...',
  },

  pt: {
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.plans': 'Planos de Investimento',
    'nav.login': 'Entrar',
    'nav.register': 'Começar',
    'hero.badge': 'Confiado por mais de 50.000 investidores',
    'hero.title': 'Sua Riqueza,',
    'hero.titleHighlight': 'Amplificada.',
    'hero.cta': 'Começar a Investir',
    'plans.title': 'Escolha Seu Caminho de Crescimento',
    'auth.login': 'Entrar',
    'auth.register': 'Criar Conta',
    'dashboard.welcome': 'Bem-vindo de volta',
    'common.loading': 'Carregando...',
  },

  ru: {
    'nav.home': 'Главная',
    'nav.about': 'О Нас',
    'nav.plans': 'Инвестиционные Планы',
    'nav.login': 'Войти',
    'nav.register': 'Начать',
    'hero.badge': 'Доверяют более 50 000 инвесторов по всему миру',
    'hero.title': 'Ваше Богатство,',
    'hero.titleHighlight': 'Усиленное.',
    'hero.cta': 'Начать Инвестировать',
    'plans.title': 'Выберите Свой Путь Роста',
    'auth.login': 'Войти',
    'auth.register': 'Создать Аккаунт',
    'dashboard.welcome': 'С возвращением',
    'common.loading': 'Загрузка...',
  },
};

// Get translation function
export function getTranslation(lang: Language, key: string): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

// Export default language
export const defaultLanguage: Language = 'en';









