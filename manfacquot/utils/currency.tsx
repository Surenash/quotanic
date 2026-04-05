import React, { useState, useEffect } from 'react';

const CurrencyContext = React.createContext({
    currency: 'USD',
    rates: {} as Record<string, number>,
    setCurrency: (c: string) => { },
    formatPrice: (amount: number | string) => ''
});

export const useCurrency = () => React.useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState(() => localStorage.getItem('userCurrency') || 'USD');
    
    // Baseline fallback rates in case the API is blocked or down
    const [rates, setRates] = useState<Record<string, number>>({ 
        USD: 1, 
        EUR: 0.92, 
        GBP: 0.79, 
        INR: 83.30, 
        CAD: 1.35, 
        AUD: 1.52, 
        JPY: 151.60 
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://api.frankfurter.app/latest?from=USD');
                if (!response.ok) throw new Error('API Response not OK');
                
                const data = await response.json();
                if (data && data.rates) {
                    setRates(prev => ({ ...prev, USD: 1, ...data.rates }));
                }
            } catch (err) {
                console.error("Failed to fetch live exchange rates, using fallbacks:", err);
            }
        };
        fetchRates();
    }, []);

    const setCurrency = (c: string) => {
        setCurrencyState(c);
        localStorage.setItem('userCurrency', c);
    };

    const formatPrice = (amount: number | string) => {
        if (amount === undefined || amount === null || amount === '') return 'N/A';
        
        // Handle cases like "$28.65" or "28.65 (0.8 hrs)" or raw numbers
        const stringVal = String(amount);
        const cleanString = stringVal.split(' ')[0].replace(/[^0-9.-]/g, '');
        const numericAmount = parseFloat(cleanString);
        
        if (isNaN(numericAmount)) return stringVal;

        const rate = rates[currency] || 1;
        const converted = numericAmount * rate;

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(converted);
        } catch (e) {
            return `${currency} ${converted.toFixed(2)}`;
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, rates, setCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};
