import React from 'react';
import { useDriver } from '../DriverContext';
import PreferenceCard from './PreferenceCard';
import DriverPreferenceService from '../../../services/driverPreferenceService';
import { useTranslation } from 'react-i18next';

const LanguageSettings = () => {
    const { language, setLanguage } = useDriver();
    const { i18n } = useTranslation();

    const handleLanguageChange = async (e) => {
        const val = e.target.value;
        const oldVal = language;
        setLanguage(val);
        
        let code = 'en';
        if (val === 'Spanish') code = 'es';
        if (val === 'French') code = 'fr';
        if (val === 'Hindi') code = 'hi';
        i18n.changeLanguage(code);

        try {
            await DriverPreferenceService.updateLanguage(val);
        } catch (error) {
            console.error('Failed to update language:', error);
            setLanguage(oldVal);
            
            let oldCode = 'en';
            if (oldVal === 'Spanish') oldCode = 'es';
            if (oldVal === 'French') oldCode = 'fr';
            if (oldVal === 'Hindi') oldCode = 'hi';
            i18n.changeLanguage(oldCode);
        }
    };

    return (
        <PreferenceCard title="Language" description="Select your preferred language.">
            <div className="setting-row">
                <div className="setting-info">
                    <h3>App Language</h3>
                </div>
                <div className="setting-action">
                    <select value={language || 'English'} onChange={handleLanguageChange}>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="Hindi">Hindi</option>
                    </select>
                </div>
            </div>
        </PreferenceCard>
    );
};

export default LanguageSettings;
