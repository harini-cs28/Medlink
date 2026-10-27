import React, { useState } from 'react';
import { Users, Plus, ShieldCheck, Mail, CheckCircle, Search, Edit2, Trash2 } from 'lucide-react';

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: 'HOSPITAL_ADMIN' | 'PHARMACY_MANAGER' | 'PHARMACIST';
  hospital: string;
  department: string;
  active: boolean;
  lastLogin: string;
}

export const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [users, setUsers] = useState<StaffUser[]>([
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      email: 'admin@medlink.health',
      role: 'HOSPITAL_ADMIN',
      hospital: 'St. Jude Central Hospital',
      department: 'Executive Governance',
      active: true,
      lastLogin: 'Today, 18:24',
    },
    {
      id: 2,
      name: 'Marcus Vance, PharmD',
      email: 'manager@medlink.health',
      role: 'PHARMACY_MANAGER',
      hospital: 'St. Jude Central Hospital',
      department: 'Main Inpatient Pharmacy',
      active: true,
      lastLogin: 'Today, 17:10',
    },
    {
      id: 3,
      name: 'Elena Rostova, RPh',
      email: 'pharmacist@medlink.health',
      role: 'PHARMACIST',
      hospital: 'St. Jude Central Hospital',
      department: 'Outpatient Dispensing Station',
      active: true,
      lastLogin: 'Today, 18:02',
    },
    {
      id: 4,
      name: 'Julian Hayes, RPh',
      email: 'j.hayes@medlink.health',
      role: 'PHARMACIST',
      hospital: 'St. Jude Central Hospital',
      department: 'Emergency Satellite Unit',
      active: true,
      lastLogin: 'Yesterday, 21:40',
    },
    {
      id: 5,
      name: 'Dr. Clara Sterling, MD',
      email: 'c.sterling@medlink.health',
      role: 'HOSPITAL_ADMIN',
      hospital: 'St. Jude Central Hospital',
      department: 'Critical Care Operations',
      active: true,
      lastLogin: 'Oct 07, 11:15',
    },
  ]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
            Governance & RBAC
          </span>
          <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
            User & <span className="italic text-[#087F73]">Staff Management</span>
          </h1>
          <p className="text-xs text-[#667572] mt-0.5">
            Role-based security governance across Hospital Admin, Pharmacy Manager, and Pharmacist tiers.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#667572] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F8F4] border border-[#172321]/10 rounded-xl text-[#172321] placeholder-[#667572]/70 focus:outline-none focus:border-[#087F73]"
            />
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  roleFilter === r
                    ? 'bg-[#172321] text-white font-semibold'
                    : 'bg-[#F7F8F4] text-[#667572] hover:text-[#172321]'
                }`}
              >
                {r === 'ALL'
                  ? 'All Roles'
                  : r === 'HOSPITAL_ADMIN'
                  ? 'Admins'
                  : r === 'PHARMACY_MANAGER'
                  ? 'Managers'
                  : 'Pharmacists'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Clinical Staff Member</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Assigned Role</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Department Unit</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Status</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Last Telemetry Active</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7F8F4]/80 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#087F73]/10 text-[#087F73] font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#172321]">{u.name}</p>
                        <p className="text-[11px] text-[#667572]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'HOSPITAL_ADMIN'
                          ? 'bg-[#172321] text-white'
                          : u.role === 'PHARMACY_MANAGER'
                          ? 'bg-[#087F73]/10 text-[#087F73]'
                          : 'bg-[#5BAFA3]/15 text-[#06655C]'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-[#172321] font-medium">{u.department}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3FA66B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FA66B]" />
                      Active
                    </span>
                  </td>
                  <td className="py-4 text-[#667572] text-[11px]">{u.lastLogin}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => alert(`Configuring permissions for ${u.name}`)}
                      className="px-2.5 py-1 rounded-lg border border-[#172321]/10 text-[#172321] hover:bg-white text-[11px] font-medium"
                    >
                      Manage Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
