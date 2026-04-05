import React, { useState, useEffect, useCallback } from 'react';

const CurrencyContext = React.createContext({
    currency: 'USD',
    rates: {} as Record<string, number>,
    setCurrency: (c: string) => { },
    formatPrice: (amount: number | string) => '',
    ratesError: null as string | null,
    isLoadingRates: true
});

export const useCurrency = () => React.useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState(() => localStorage.getItem('userCurrency') || 'USD');
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
    const [ratesError, setRatesError] = useState<string | null>(null);
    const [isLoadingRates, setIsLoadingRates] = useState(true);

    const fetchWithFallback = useCallback(async () => {
        setIsLoadingRates(true);
        setRatesError(null);

        // Provider 1: Frankfurter (Official, high reliability)
        try {
            const resp = await fetch('https://api.frankfurter.app/latest?from=USD');
            if (resp.ok) {
                const data = await resp.json();
                if (data?.rates) {
                    setRates({ USD: 1, ...data.rates });
                    setIsLoadingRates(false);
                    return;
                }
            }
        } catch (e) { console.warn("Frankfurter API failed, trying fallback 1..."); }

        // Provider 2: Open ER API (High reliability fallback)
        try {
            const resp = await fetch('https://open.er-api.com/v6/latest/USD');
            if (resp.ok) {
                const data = await resp.json();
                if (data?.rates) {
                    setRates(data.rates);
                    setIsLoadingRates(false);
                    return;
                }
            }
        } catch (e) { console.warn("Open ER API failed, trying fallback 2..."); }

        // Provider 3: JSDelivr Currency API (Mirror of Fawaz Ahmed)
        try {
            const resp = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
            if (resp.ok) {
                const data = await resp.json();
                if (data?.usd) {
                    // Normalize keys to uppercase to match other providers
                    const normalizedRates: Record<string, number> = { USD: 1 };
                    Object.entries(data.usd).forEach(([k, v]) => {
                        normalizedRates[k.toUpperCase()] = v as number;
                    });
                    setRates(normalizedRates);
                    setIsLoadingRates(false);
                    return;
                }
            }
        } catch (e) { console.warn("JSDelivr API failed."); }

        // If all fail
        setRatesError("Critical Error: Unable to fetch live exchange rates from any provider. Currency conversion is currently unavailable to ensure quote accuracy.");
        setIsLoadingRates(false);
    }, []);

    useEffect(() => {
        fetchWithFallback();
    }, [fetchWithFallback]);

    const setCurrency = (c: string) => {
        setCurrencyState(c);
        localStorage.setItem('userCurrency', c);
    };

    const formatPrice = (amount: number | string) => {
        if (amount === undefined || amount === null || amount === '') return 'N/A';
        
        const stringVal = String(amount);
        const cleanString = stringVal.split(' ')[0].replace(/[^0-9.-]/g, '');
        const numericAmount = parseFloat(cleanString);
        
        if (isNaN(numericAmount)) return stringVal;

        // Ensure we have the rate for the target currency
        const rate = rates[currency];
        
        // If we are trying to convert to something other than USD but have no rates
        if (currency !== 'USD' && !rates[currency]) {
            if (ratesError) return `Conversion Error: ${currency} rate unavailable`;
            return `Loading ${currency}...`;
        }

        const converted = numericAmount * (rate || 1);

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
        <CurrencyContext.Provider value={{ currency, rates, setCurrency, formatPrice, ratesError, isLoadingRates }}>
            {children}
        </CurrencyContext.Provider>
    );
};
