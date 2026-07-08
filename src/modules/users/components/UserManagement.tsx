'use client';

import { useState } from "react";
import useSWR from "swr";
import { UserHeader } from "./UserHeader";
import { UserFilterBar } from "./UserFilterBar";
import { UserTable } from "./UserTable";
import { UserDrawer } from "./UserDrawer";
import { InviteUserModal } from "./InviteUserModal";
import { UserRow } from "../types";

const fetcher = (url: string) => fetch(url).then(r => r.json()).then(res => {
  if (!res.success) throw new Error(res.error?.message || 'Error fetching data');
  return res.data;
});

export function UserManagement() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (role !== "all") params.set("role", role);
  if (status !== "all") params.set("status", status);
  
  const url = `/api/users${params.toString() ? `?${params.toString()}` : ""}`;
  const { data: users = [], isLoading, mutate } = useSWR<UserRow[]>(url, fetcher);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <UserHeader 
        totalUsers={users.length} 
        onInviteClick={() => setIsInviteModalOpen(true)} 
      />
      
      <div className="rounded-2xl border border-premium-border bg-white p-4 shadow-sm dark:bg-black/40">
        <UserFilterBar 
          query={query}
          setQuery={setQuery}
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
        />
        
        <div className="mt-4">
          <UserTable 
            users={users} 
            isLoading={isLoading} 
            onEdit={(user) => {
              setSelectedUser(user);
              setIsDrawerOpen(true);
            }} 
          />
        </div>
      </div>

      <UserDrawer 
        user={selectedUser}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => mutate()}
      />

      <InviteUserModal 
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
