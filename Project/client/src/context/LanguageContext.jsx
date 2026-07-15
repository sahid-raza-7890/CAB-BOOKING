import React, { createContext, useContext, useEffect, useState } from 'react';
import userPreferenceService from '../services/userPreferenceService';

const translations = {
  English: {
    dashboard: 'Dashboard',
    wallet: 'Wallet',
    wallet_balance: 'WALLET BALANCE',
    refer_earn: 'Refer & Earn',
    earn_150: 'Earn ₹150',
    book_ride: 'Book a Ride',
    your_journey: 'Your Journey, Simplified.',
    pickup: 'Pickup Location',
    dropoff: 'Drop-off Location',
    where_to: 'Where would you like to go?',
    where_from: 'Where are you starting from?',
    saved_places: 'Saved Places',
    pricing_normal: 'Pricing: Normal',
    estimate_book: 'Estimate Fare & Book Ride',
    quick_actions: 'Quick Actions',
    recent_rides: 'Recent Rides',
    go_anywhere: 'Go Anywhere',
    safety_security: 'Safety & Security',
    invite_friends: 'Invite Friends',
    sign_out: 'Sign Out',
    my_rides: 'My Rides',
    intercity: 'Intercity',
    rentals: 'Rentals',
    offers: 'Offers',
    support: 'Support',
    safety: 'Safety',
    help: 'Help',
    settings: 'Settings'
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    wallet: 'वॉलेट',
    wallet_balance: 'वॉलेट बैलेंस',
    refer_earn: 'रेफर करें और कमाएं',
    earn_150: '₹150 कमाएं',
    book_ride: 'सवारी बुक करें',
    your_journey: 'आपकी यात्रा, सरल।',
    pickup: 'पिकअप स्थान',
    dropoff: 'छोड़ने का स्थान',
    where_to: 'आप कहाँ जाना चाहेंगे?',
    where_from: 'आप कहाँ से शुरू कर रहे हैं?',
    saved_places: 'सहेजे गए स्थान',
    pricing_normal: 'मूल्य निर्धारण: सामान्य',
    estimate_book: 'किराये का अनुमान और बुक करें',
    quick_actions: 'त्वरित कार्रवाई',
    recent_rides: 'हाल की सवारी',
    go_anywhere: 'कहीं भी जाएं',
    safety_security: 'सुरक्षा और बचाव',
    invite_friends: 'दोस्तों को आमंत्रित करें',
    sign_out: 'साइन आउट',
    my_rides: 'मेरी सवारी',
    intercity: 'इंटरसिटी',
    rentals: 'किराये पर',
    offers: 'ऑफर',
    support: 'सहायता',
    safety: 'सुरक्षा',
    help: 'मदद',
    settings: 'सेटिंग्स'
  },
  Telugu: {
    dashboard: 'డాష్‌బోర్డ్',
    wallet: 'వాలెట్',
    wallet_balance: 'వాలెట్ బ్యాలెన్స్',
    refer_earn: 'రెఫర్ చేయండి & సంపాదించండి',
    earn_150: '₹150 సంపాదించండి',
    book_ride: 'రైడ్‌ని బుక్ చేయండి',
    your_journey: 'మీ ప్రయాణం, సరళీకృతం.',
    pickup: 'పికప్ స్థానం',
    dropoff: 'డ్రాప్-ఆఫ్ స్థానం',
    where_to: 'మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు?',
    where_from: 'మీరు ఎక్కడి నుండి బయలుదేరుతున్నారు?',
    saved_places: 'సేవ్ చేసిన స్థలాలు',
    pricing_normal: 'ధర: సాధారణం',
    estimate_book: 'ఛార్జీని అంచనా వేయండి & బుక్ చేయండి',
    quick_actions: 'త్వరిత చర్యలు',
    recent_rides: 'ఇటీవలి రైడ్లు',
    go_anywhere: 'ఎక్కడికైనా వెళ్లండి',
    safety_security: 'భద్రత & రక్షణ',
    invite_friends: 'స్నేహితులను ఆహ్వానించండి',
    sign_out: 'సైన్ అవుట్',
    my_rides: 'నా రైడ్లు',
    intercity: 'ఇంటర్సిటీ',
    rentals: 'అద్దెలు',
    offers: 'ఆఫర్‌లు',
    support: 'మద్దతు',
    safety: 'భద్రత',
    help: 'సహాయం',
    settings: 'సెట్టింగ్‌లు'
  }
};

export const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('English');

  useEffect(() => {
    const loadLang = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return; // Not logged in, use defaults
      try {
        const prefs = await userPreferenceService.getPreferences();
        if (prefs && prefs.language) {
          setLanguageState(prefs.language);
        }
      } catch (err) {
        // Silently ignore auth errors on login pages
        if (!err.message?.includes('401')) {
          console.error('Failed to load language', err);
        }
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (newLang) => {
    setLanguageState(newLang);
    try {
      await userPreferenceService.updateLanguage(newLang);
    } catch (err) {
      console.error('Failed to save language', err);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['English'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
