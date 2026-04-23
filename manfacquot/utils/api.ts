// API Client extracted from index.tsx

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api'; // Uses env var in production

export const getTokens = () => ({
    access: localStorage.getItem('accessToken'),
    refresh: localStorage.getItem('refreshToken'),
});

export const setTokens = (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const headers = new Headers(options.headers || {});
        const { access } = getTokens();
        if (access) {
            headers.set('Authorization', `Bearer ${access}`);
        }
        if (options.body && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
            options.body = JSON.stringify(options.body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            if (response.status === 401) {
                clearTokens();
                window.location.href = '/login';
            }
            const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred.' }));

            // For validation errors (400), try to extract field-specific errors
            if (response.status === 400 && typeof errorData === 'object' && !errorData.detail) {
                // Format validation errors like: "field1: error message, field2: error message"
                const errorMessages = Object.entries(errorData)
                    .map(([field, errors]) => {
                        const errorList = Array.isArray(errors) ? errors : [errors];
                        return `${field}: ${(errorList as string[]).join(', ')}`;
                    })
                    .join('; ');
                throw new Error(errorMessages || `Request failed with status ${response.status}`);
            }

            throw new Error(errorData.detail || `Request failed with status ${response.status}`);
        }

        if (response.status === 204) { return null; }
        return response.json();
    },

    login(credentials: object) {
        return this.request('/auth/token/', { method: 'POST', body: credentials });
    },

    register(userData: object) {
        return this.request('/auth/register/', { method: 'POST', body: userData });
    },

    getMe() {
        return this.request('/auth/me/');
    },

    getDesigns() {
        return this.request('/designs/');
    },

    deleteDesign(id: string) {
        return this.request(`/designs/${id}/`, { method: 'DELETE' });
    },

    getUploadUrl(fileName: string, fileType: string) {
        return this.request('/designs/upload-url/', { method: 'POST', body: { fileName, fileType } });
    },

    async uploadFileToS3(url: string, file: File) {
        const response = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
        });
        if (!response.ok) { throw new Error('Failed to upload file to S3.'); }
    },

    createDesign(designData: object) {
        return this.request('/designs/', { method: 'POST', body: designData });
    },

    updateDesignThumbnail(designId: string, thumbnailUrl: string) {
        return this.request(`/designs/${designId}/thumbnail/`, {
            method: 'PATCH',
            body: { thumbnail_url: thumbnailUrl }
        });
    },

    updateManufacturerProfile(profileData: object) {
        return this.request('/manufacturers/profile/', { method: 'PUT', body: profileData });
    },

    // Manufacturer Dashboard APIs
    getManufacturerProfile(): Promise<any> {
        return this.request('/manufacturers/profile/');
    },

    getDashboardStats(): Promise<any> {
        return this.request('/manufacturers/dashboard/stats/');
    },

    getRecentActivity(): Promise<any> {
        return this.request('/manufacturers/dashboard/recent-activity/');
    },

    getQuoteRequests() {
        // For manufacturers, this lists all quotes (which act as requests)
        return this.request('/quotes/');
    },

    submitQuote(designId: string, quoteData: object) {
        return this.request(`/designs/${designId}/quotes/`, { method: 'POST', body: quoteData });
    },

    declineQuoteRequest(designId: string) {
        // Mock decline - in real app would interact with backend
        console.log(`MOCK API: Declining quote request for design ${designId}`);
        return new Promise(resolve => setTimeout(() => resolve({ success: true, designId }), 300));
    },

    getActiveOrders() {
        return this.request('/orders/');
    },

    updateOrder(orderId: string, orderData: object) {
        return this.request(`/orders/${orderId}/`, { method: 'PATCH', body: orderData });
    },

    // Manufacturer Directory API
    getManufacturers(): Promise<unknown> {
        return this.request('/manufacturers/');
    },

    getManufacturerById(id): Promise<any> {
        return this.request(`/manufacturers/${id}/`);
    },

    // Customer Dashboard APIs
    getCustomerProfile(): Promise<any> {
        return this.request('/auth/me/');
    },

    updateCustomerProfile(profileData: object): Promise<any> {
        return this.request('/auth/me/', { method: 'PATCH', body: profileData });
    },

    // Manufacturer Settings APIs
    getManufacturerSettings(): Promise<any> {
        return this.request('/manufacturers/settings/');
    },

    updateManufacturerSettings(settings: object): Promise<any> {
        return this.request('/manufacturers/settings/', { method: 'PUT', body: settings });
    },

    resetManufacturerSettings(): Promise<any> {
        return this.request('/manufacturers/settings/reset/', { method: 'POST' });
    },

    getCustomerDesigns(): Promise<any> {
        return this.request('/designs/');
    },

    getDesignById(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/`);
    },

    deleteCustomerDesign(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/`, { method: 'DELETE' });
    },

    getCustomerOrders(): Promise<any> {
        return this.request('/orders/');
    },

    // FBM Analysis APIs
    getFBMAnalysis(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/fbm-analysis/`);
    },

    getFBMFeatures(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/fbm-features/`);
    },

    getFBMOperations(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/fbm-operations/`);
    },

    getFBMPatterns(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/fbm-patterns/`);
    },

    getFBMIntelligence(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/fbm-intelligence/`);
    },

    getFBMExport(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/fbm-export/`);
    },

    generateQuotes(designId: string, manufacturerId?: string): Promise<any> {
        const body = manufacturerId ? { manufacturer_id: manufacturerId } : undefined;
        return this.request(`/designs/${designId}/generate-quotes/`, { method: 'POST', body });
    },

    getDesignQuotes(designId: string): Promise<any> {
        return this.request(`/designs/${designId}/quotes/`);
    },

    updateQuoteStatus(quoteId: string, status: string): Promise<any> {
        return this.request(`/quotes/${quoteId}/`, { method: 'PATCH', body: { status } });
    },
};
