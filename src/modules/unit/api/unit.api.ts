export const unitApi = {
    async getUnits() {
        const response = await fetch('/api/units');
        return response.json();
    },
    async getUnitById(id: string) {
        const response = await fetch(`/api/units/${id}`);
        return response.json();
    },
    async createUnit(data: any) {
        const response = await fetch('/api/units', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async updateUnit(id: string, data: any) {
        const response = await fetch(`/api/units/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async deleteUnit(id: string) {
        const response = await fetch(`/api/units/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    },
}
