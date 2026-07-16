"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type User = { id: string; name: string; email: string; role: string; createdAt: string };

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const id = (params as any)?.id;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", role: "MANAGER", currentPassword: "", newPassword: "" });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/users/${id}`).then(r=>r.json()).then(data=>{ setUser(data); setForm(f=>({ ...f, name: data?.name ?? "", role: data?.role ?? "MANAGER" })); }).finally(()=>setLoading(false));
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const body: any = { name: form.name, role: form.role };
      if (form.newPassword) { body.newPassword = form.newPassword; body.currentPassword = form.currentPassword; }
      const res = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        alert("Updated");
      } else {
        alert("Update failed");
      }
    } catch (err) { console.error(err); }
  }

  async function handleDelete() {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard"); else alert("Delete failed");
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">{user.name}</h2>
      <p className="mb-2">Email: {user.email}</p>
      <p className="mb-4">Role: {user.role}</p>

      <form onSubmit={handleUpdate} className="space-y-2 mb-4">
        <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="VIEWER">VIEWER</option>
        </select>

        <hr />
        <input type="password" placeholder="Current password (required to change)" className="input" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})} />
        <input type="password" placeholder="New password" className="input" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})} />

        <div className="flex gap-2">
          <button className="btn-primary" type="submit">Save</button>
          <button type="button" className="btn-ghost" onClick={handleDelete}>Delete</button>
        </div>
      </form>
    </div>
  );
}
