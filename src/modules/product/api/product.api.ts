export const productApi = {
    async getProducts() {
        const response = await fetch('/api/products');
        return response.json();
    },
    async getProductById(id: string) {
        const response = await fetch(`/api/products/${id}`);
        return response.json();
    },
    async createProduct(data: any) {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async updateProduct(id: string, data: any) {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async deleteProduct(id: string) {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    },
}
