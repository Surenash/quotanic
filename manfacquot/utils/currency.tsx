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
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Frankfurter API is free and doesn't require a key
                const response = await fetch('https://api.frankfurter.app/latest?from=USD');
                const data = await response.json();
                if (data && data.rates) {
                    setRates({ USD: 1, ...data.rates });
                }
            } catch (err) {
                console.error("Failed to fetch exchange rates:", err);
            }
        };
        fetchRates();
    }, []);

    const setCurrency = (c: string) => {
        setCurrencyState(c);
        localStorage.setItem('userCurrency', c);
    };

    const formatPrice = (amount: number | string) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numericAmount)) return 'N/A';

        const rate = rates[currency] || 1;
        const converted = numericAmount * rate;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, rates, setCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};
