export const supplierApi = {
  async getById(id: string) {
    const res = await fetch(`/api/suppliers/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch supplier");
    return res.json();
  },

  async getAll() {
    const res = await fetch(`/api/suppliers`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    return res.json();
  },

  async create(payload: any) {
    const res = await fetch(`/api/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Create failed");
    return res.json();
  },

  async update(id: string, payload: any) {
    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    return res.json();
  },

  async bulkDelete(ids: string[]) {
    const res = await fetch(`/api/suppliers`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error("Bulk delete failed");
    return res.json();
  },
};
