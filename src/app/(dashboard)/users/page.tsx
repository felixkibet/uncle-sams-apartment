"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";

type User = { id: string; name: string; email: string; role: string; createdAt: string };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MANAGER" });

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        setForm({ name: "", email: "", password: "", role: "MANAGER" });
        setShowForm(false);
        fetchUsers();
      } else {
        console.error(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  }

  const columns = [
    { key: "name", header: "Name", render: (r: User) => <a className="text-blue-600 hover:underline" href={`/users/${r.id}`}>{r.name}</a> },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "createdAt", header: "Created" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div>
          <button className="btn" onClick={() => setShowForm(s => !s)}>{showForm ? "Cancel" : "Create user"}</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 space-y-2 max-w-md">
          <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input" />
          <input required placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input" />
          <input required placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="input" />
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="input">
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="VIEWER">VIEWER</option>
          </select>
          <div>
            <button className="btn-primary" type="submit">Create</button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        keyExtractor={(r: User) => r.id}
        emptyMessage="No users yet"
      />
    </div>
  );
}
