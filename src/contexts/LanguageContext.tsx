import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    'common.home': 'Home',
    'common.dashboard': 'Dashboard',
    'common.playground': 'Playground',
    'common.newGame': 'New Game',
    'common.profile': 'Profile',
    'common.settings': 'Settings',
    'common.logout': 'Logout',
    'common.confirm': 'Confirm',
    'common.clear': 'Clear',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    
    // Login
    'login.title': 'LULU Bingo',
    'login.subtitle': 'Admin Portal',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.button': 'Login',
    'login.forgotPassword': 'Forgot Password?',
    
    // Dashboard
    'dashboard.deposit': 'Deposit',
    'dashboard.gamesToday': 'Games Today',
    'dashboard.earningToday': 'Earning Today',
    'dashboard.availableBalance': 'Available Balance',
    'dashboard.recentGames': 'Recent Games',
    'dashboard.game': 'Game',
    'dashboard.stake': 'Stake',
    'dashboard.players': 'Players',
    'dashboard.calls': 'Calls',
    'dashboard.winner': 'Winner',
    'dashboard.bonus': 'Bonus',
    'dashboard.free': 'Free',
    'dashboard.status': 'Status',
    'dashboard.playing': 'PLAYING',
    
    // Playground
    'playground.game': 'GAME',
    'playground.stake': 'STAKE',
    'playground.winPrice': 'WIN PRICE',
    'playground.called': 'CALLED',
    'playground.startNewGame': 'START NEW GAME',
    'playground.shuffle': 'SHUFFLE',
    'playground.autoCall': 'Auto call',
    'playground.seconds': 'seconds',
    'playground.enterCartela': 'Enter Cartela',
    'playground.cartelaPlaceholder': 'Enter cartela number',
    'playground.check': 'CHECK',
    'playground.winMoney': 'WIN MONEY',
    'playground.birr': 'Birr',
    'playground.footer': '© 2024 Dallol Technologies. All rights reserved.',
    
    // New Game
    'newGame.title': 'New Game',
    'newGame.badWallet': 'BAD WALLET',
    'newGame.gameConfig': 'Game Configuration',
    'newGame.game': 'Game:',
    'newGame.betBirr': 'Bet Birr:',
    'newGame.numPlayers': 'No. of players:',
    'newGame.winBirr': 'Win Birr:',
    'newGame.bonus': 'Bonus:',
    'newGame.freeHit': 'Free Hit:',
    'newGame.choosePatterns': 'Choose Patterns',
    'newGame.enterNumber': 'Enter number',
    'newGame.enterBonus': 'Enter bonus',
    'newGame.enterFreeHits': 'Enter free hits',
    'newGame.range': '100-200',
    
    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.fullName': 'Full Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.role': 'Role',
    'profile.admin': 'Admin',
    'profile.businessInfo': 'Business Information',
    'profile.businessName': 'Business Name',
    'profile.businessId': 'Business ID',
    'profile.taxId': 'Tax ID',
    'profile.accountInfo': 'Account Information',
    'profile.joinedDate': 'Joined Date',
    'profile.lastLogin': 'Last Login',
    'profile.status': 'Status',
    'profile.active': 'Active',
    
    // Settings
    'settings.title': 'Settings',
    'settings.notifications': 'Notifications',
    'settings.pushNotifications': 'Push Notifications',
    'settings.pushNotificationsDesc': 'Receive push notifications for game updates',
    'settings.emailAlerts': 'Email Alerts',
    'settings.emailAlertsDesc': 'Get email alerts for important events',
    'settings.languageRegion': 'Language & Region',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose your preferred language',
    'settings.currency': 'Currency',
    'settings.currencyDesc': 'Select display currency',
    'settings.security': 'Security',
    'settings.autoBackup': 'Auto Backup',
    'settings.autoBackupDesc': 'Automatically backup data daily',
    'settings.changePassword': 'Change Password',
    'settings.changePasswordDesc': 'Update your account password',
    'settings.change': 'Change',
    'settings.appearance': 'Appearance',
    'settings.themeMode': 'Theme Mode',
    'settings.themeModeDesc': 'Use the toggle in header to switch themes',
  },
  am: {
    // Common
    'common.home': 'መነሻ',
    'common.dashboard': 'ዳሽቦርድ',
    'common.playground': 'የጨዋታ ሜዳ',
    'common.newGame': 'አዲስ ጨዋታ',
    'common.profile': 'መገለጫ',
    'common.settings': 'ቅንብሮች',
    'common.logout': 'ውጣ',
    'common.confirm': 'አረጋግጥ',
    'common.clear': 'አጥፋ',
    'common.cancel': 'ሰርዝ',
    'common.save': 'አስቀምጥ',
    'common.edit': 'አርትዕ',
    'common.delete': 'ሰርዝ',
    
    // Login
    'login.title': 'ሉሉ ቢንጎ',
    'login.subtitle': 'የአስተዳዳሪ በር',
    'login.username': 'የተጠቃሚ ስም',
    'login.password': 'የይለፍ ቃል',
    'login.button': 'ግባ',
    'login.forgotPassword': 'የይለፍ ቃል ረሱ?',
    
    // Dashboard
    'dashboard.deposit': 'ተቀማጭ',
    'dashboard.gamesToday': 'ዛሬ ጨዋታዎች',
    'dashboard.earningToday': 'ዛሬ ገቢ',
    'dashboard.availableBalance': 'ያለው ሂሳብ',
    'dashboard.recentGames': 'የቅርብ ጊዜ ጨዋታዎች',
    'dashboard.game': 'ጨዋታ',
    'dashboard.stake': 'ድርሻ',
    'dashboard.players': 'ተጫዋቾች',
    'dashboard.calls': 'ጥሪዎች',
    'dashboard.winner': 'አሸናፊ',
    'dashboard.bonus': 'ቦነስ',
    'dashboard.free': 'ነጻ',
    'dashboard.status': 'ሁኔታ',
    'dashboard.playing': 'በመጫወት ላይ',
    
    // Playground
    'playground.game': 'ጨዋታ',
    'playground.stake': 'ድርሻ',
    'playground.winPrice': 'የአሸናፊ ሽልማት',
    'playground.called': 'የተጠሩ',
    'playground.startNewGame': 'አዲስ ጨዋታ ጀምር',
    'playground.shuffle': 'ቀላቅል',
    'playground.autoCall': 'በራስ ሰር ጥሪ',
    'playground.seconds': 'ሰከንዶች',
    'playground.enterCartela': 'ካርቴላ አስገባ',
    'playground.cartelaPlaceholder': 'የካርቴላ ቁጥር አስገባ',
    'playground.check': 'አረጋግጥ',
    'playground.winMoney': 'ያሸነፉት ገንዘብ',
    'playground.birr': 'ብር',
    'playground.footer': '© 2024 ዳሎል ቴክኖሎጂስ። መብቱ በህግ የተጠበቀ ነው።',
    
    // New Game
    'newGame.title': 'አዲስ ጨዋታ',
    'newGame.badWallet': 'መጥፎ ቦርሳ',
    'newGame.gameConfig': 'የጨዋታ ማዋቀሪያ',
    'newGame.game': 'ጨዋታ፡',
    'newGame.betBirr': 'ውርርድ ብር፡',
    'newGame.numPlayers': 'የተጫዋቾች ብዛት፡',
    'newGame.winBirr': 'አሸናፊ ብር፡',
    'newGame.bonus': 'ቦነስ፡',
    'newGame.freeHit': 'ነጻ መምታት፡',
    'newGame.choosePatterns': 'ቅጦችን ምረጥ',
    'newGame.enterNumber': 'ቁጥር አስገባ',
    'newGame.enterBonus': 'ቦነስ አስገባ',
    'newGame.enterFreeHits': 'ነጻ መምታቶችን አስገባ',
    'newGame.range': '100-200',
    
    // Profile
    'profile.title': 'መገለጫ',
    'profile.personalInfo': 'የግል መረጃ',
    'profile.fullName': 'ሙሉ ስም',
    'profile.email': 'ኢሜል',
    'profile.phone': 'ስልክ',
    'profile.role': 'ሚና',
    'profile.admin': 'አስተዳዳሪ',
    'profile.businessInfo': 'የንግድ መረጃ',
    'profile.businessName': 'የንግድ ስም',
    'profile.businessId': 'የንግድ መለያ',
    'profile.taxId': 'የግብር መለያ',
    'profile.accountInfo': 'የሂሳብ መረጃ',
    'profile.joinedDate': 'የተቀላቀለበት ቀን',
    'profile.lastLogin': 'የመጨረሻ መግቢያ',
    'profile.status': 'ሁኔታ',
    'profile.active': 'ንቁ',
    
    // Settings
    'settings.title': 'ቅንብሮች',
    'settings.notifications': 'ማሳወቂያዎች',
    'settings.pushNotifications': 'የግፊት ማሳወቂያዎች',
    'settings.pushNotificationsDesc': 'ለጨዋታ ዝማኔዎች የግፊት ማሳወቂያዎችን ተቀበል',
    'settings.emailAlerts': 'የኢሜል ማንቂያዎች',
    'settings.emailAlertsDesc': 'ለአስፈላጊ ክስተቶች የኢሜል ማንቂያዎችን ተቀበል',
    'settings.languageRegion': 'ቋንቋ እና ክልል',
    'settings.language': 'ቋንቋ',
    'settings.languageDesc': 'የሚመርጡትን ቋንቋ ይምረጡ',
    'settings.currency': 'ገንዘብ',
    'settings.currencyDesc': 'የማሳያ ገንዘብ ይምረጡ',
    'settings.security': 'ደህንነት',
    'settings.autoBackup': 'በራስ ሰር መደገፍ',
    'settings.autoBackupDesc': 'መረጃን በየቀኑ በራስ ሰር ደግፍ',
    'settings.changePassword': 'የይለፍ ቃል ቀይር',
    'settings.changePasswordDesc': 'የሂሳብዎን የይለፍ ቃል ያዘምኑ',
    'settings.change': 'ቀይር',
    'settings.appearance': 'ገጽታ',
    'settings.themeMode': 'የገጽታ ሁነታ',
    'settings.themeModeDesc': 'ጭብጦችን ለመቀየር በራስጌ ውስጥ ያለውን መቀየሪያ ይጠቀሙ',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
