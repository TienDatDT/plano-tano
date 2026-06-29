export const unitConversionApi = {
    async getConversions() {
        const response = await fetch('/api/unitconversions');
        return response.json();
    },
    async getConversionById(id: string) {
        const response = await fetch(`/api/unitconversions/${id}`);
        return response.json();
    },
    async createConversion(data: any) {
        const response = await fetch('/api/unitconversions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async updateConversion(id: string, data: any) {
        const response = await fetch(`/api/unitconversions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async deleteConversion(id: string) {
        const response = await fetch(`/api/unitconversions/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    },
}
