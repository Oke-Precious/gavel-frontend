import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const DICTIONARY = {
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.lookup': 'Look Up a Case',
    'nav.transparency': 'Transparency',
    'nav.map': 'Backlog Map',
    'nav.volunteer': 'Volunteer',
    'nav.login': 'Sign In',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Sign Out',

    // Hero & Common
    'hero.badge': 'Administration of Criminal Justice Act (ACJA 2015) Statutory Monitor',
    'hero.title': 'Tracking Justice With Transparency',
    'hero.subtitle': 'A transparent case tracking system for awaiting-trial detainees in Nigeria. Verify statutory remand limits under Section 296 of the ACJA 2015 without exposing private identities.',
    'hero.input_placeholder': 'Enter Case Hash ID (e.g. GAV-26-AD447B)',
    'hero.track_btn': 'Audit Case Status',
    'hero.ussd_prompt': 'No smartphone or 4G data? Access via USSD dialer (*384*26#)',

    // Remand & Stats
    'stat.days_in_custody': 'Days in Custody',
    'stat.statutory_limit': 'Legal Limit (28 Days)',
    'stat.alert_compliant': 'Compliant',
    'stat.alert_warning': '28-Day Warning',
    'stat.alert_critical': 'Critical Overdue (90+ Days)',
    'stat.active_backlog': 'National Backlog',
    'stat.pre_trial_pct': 'Awaiting Trial Ratio',

    // Bottlenecks
    'bottleneck.dpp': 'Awaiting DPP Legal Advice',
    'bottleneck.transit': 'Police Case File in Transit',
    'bottleneck.adjournment': 'Court Adjournment',
    'bottleneck.counsel': 'Unrepresented / Missing Counsel',
    'bottleneck.escort': 'Correctional Transport Logistics',

    // Print & Tools
    'slip.print_btn': 'Print Official Remand Slip',
    'slip.download_qr': 'Scan or Print QR Docket Card',
    'ussd.dial_title': 'Feature Phone USSD Simulator (*384*26#)',
  },
  pcm: {
    // Navigation
    'nav.about': 'About GAVEL',
    'nav.lookup': 'Check Case Wey Dey Court',
    'nav.transparency': 'Court Open Data',
    'nav.map': 'Naija Backlog Map',
    'nav.volunteer': 'Free Lawyer Volunteer',
    'nav.login': 'Oga Login',
    'nav.dashboard': 'Control Room',
    'nav.logout': 'Comot Body',

    // Hero & Common
    'hero.badge': 'ACJA 2015 Law Monitor — Wey Say Nobody Suppose Languish Inside Prison',
    'hero.title': 'Open Eye Tracking For Justice Inside Naija',
    'hero.subtitle': 'Clear system to track people wey police and court remand inside cell and prison. Check if government don detain person pass the 28 days wey Section 296 of ACJA law talk, without to leak their personal name.',
    'hero.input_placeholder': 'Put di Case Hash ID (e.g. GAV-26-AD447B)',
    'hero.track_btn': 'Check Di Case Now',
    'hero.ussd_prompt': 'You no get smartphone or data? Press *384*26# on top small phone',

    // Remand & Stats
    'stat.days_in_custody': 'Days Wey Person Don Spend Inside Cell',
    'stat.statutory_limit': 'Limit Wey Law Give (28 Days)',
    'stat.alert_compliant': 'Normal (No Delay)',
    'stat.alert_warning': 'Warning (E Don Pass 28 Days)',
    'stat.alert_critical': 'Heavy Wahala (Pass 90 Days)',
    'stat.active_backlog': 'Total Case Wey Hang',
    'stat.pre_trial_pct': 'People Wey Never See Trial',

    // Bottlenecks
    'bottleneck.dpp': 'We Dey Wait For DPP Legal Advice',
    'bottleneck.transit': 'Police File Dey Waka On Di Road',
    'bottleneck.adjournment': 'Judge Don Shift Di Court Date',
    'bottleneck.counsel': 'No Lawyer / Lawyer Never Show Up',
    'bottleneck.escort': 'Prisons Van No Get Fuel or Escort',

    // Print & Tools
    'slip.print_btn': 'Print Court Remand Slip Paper',
    'slip.download_qr': 'Scan or Print QR Card',
    'ussd.dial_title': 'Small Phone USSD Simulator (*384*26#)',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('gavel_language') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gavel_language', language);
    } catch {}
  }, [language]);

  const t = (key, fallback = '') => {
    return DICTIONARY[language]?.[key] || DICTIONARY['en']?.[key] || fallback || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'pcm' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (k, fb = '') => fb || k,
    };
  }
  return context;
}
