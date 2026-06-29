export const categoryApi ={
    async getById(id:string){
        const res = await fetch(`/api/categories/${id}`,{
            cache: "no-store"
        });

        if(!res.ok) throw new Error("Failed to fetch category");

        return res.json();
    },
    async getAll(){
        const res = await fetch(`/api/categories`,{
            cache: "no-store"
        });

        if(!res.ok) throw new Error("Failed to fetch category");

        return res.json();
    },

    async delete(id: string){
        const res= await fetch(`/api/categories/${id}`,{
            method: "DELETE"
        });

        if(!res.ok) throw new Error("Delete failed");

        return res.json();
    },

    async create(payload: any){
        const res= await fetch(`/api/categories`,{
            method: "POST",
            body: JSON.stringify(payload)
        })
    },

    async update(id:string, payload: any){
        const res= await fetch(`/api/categories/${id}`,{
            method: "PUT",
            body: JSON.stringify(payload),
        });
        if(!res.ok) throw new Error("Update failed");

        return res.json();
    }



}
