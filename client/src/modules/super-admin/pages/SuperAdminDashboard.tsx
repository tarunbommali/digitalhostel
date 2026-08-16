import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Building2,
  Plus,
  Shield,
  MapPin,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    location: "Bangalore",
    plan: "Pro",
    subscriptionStatus: "Active",
    adminName: "",
    adminEmail: "",
    adminPassword: "Bommali@2001",
    tagline: "Modern Premium Student Hostel & Residency",
    logoUrl: "",
    primaryColor: "#6366F1",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/super-admin/organizations");
      setOrganizations(data);
    } catch (e: any) {
      try {
        const publicData = await api.get<any[]>("/organizations/public");
        setOrganizations(publicData);
      } catch (err: any) {
        console.error("Failed to load organizations:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        location: formData.location,
        plan: formData.plan.toLowerCase(),
        subscriptionStatus: formData.subscriptionStatus.toLowerCase(),
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        branding: {
          tagline: formData.tagline,
          logoUrl: formData.logoUrl,
          primaryColor: formData.primaryColor,
          secondaryColor: "#4f46e5",
        },
        settings: {
          maxStudents: 200,
          maxRooms: 50,
          maxStaff: 20,
          allowBulkImport: true,
        },
      };

      await api.post("/super-admin/organizations", payload);
      toast.success(`Organization "${formData.name}" and Admin account created successfully!`);
      setShowModal(false);
      setFormData({
        name: "",
        slug: "",
        location: "Bangalore",
        plan: "Pro",
        subscriptionStatus: "Active",
        adminName: "",
        adminEmail: "",
        adminPassword: "Bommali@2001",
        tagline: "Modern Premium Student Hostel & Residency",
        logoUrl: "",
        primaryColor: "#6366F1",
      });
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white font-sans">
      {/* Super Admin Top Header (72px fixed height, bg-[#12121C], bottom hairline border #2A2A3D) */}
      <header className="h-[72px] border-b border-[#2A2A3D] bg-[#12121C] sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 rounded-xl bg-[#6366F1] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Inside <span className="text-gradient-brand">Home</span>
                </span>
                <span className="ml-3 text-xs bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                navigate("/super-admin/login");
              }}
              className="border-white/10 bg-transparent hover:bg-[#1A1A28] text-[#A1A1B5] hover:text-white rounded-xl px-4 py-2 text-xs font-semibold gap-1.5"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container (max-width 1280px) */}
      <main className="max-w-[1280px] mx-auto px-6 md:px-8 py-10">


        {/* Organizations Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-[-0.02em] flex items-center gap-2">
              Registered Organizations
              <span className="text-xs bg-[#12121C] text-[#A1A1B5] px-3 py-1 rounded-full border border-[#2A2A3D]">
                {organizations.length} Total
              </span>
            </h3>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold gap-2 shadow-lg shadow-[#6366F1]/20 rounded-xl px-5 py-2.5 text-xs"
            >
              <Plus className="w-4 h-4" /> Create Organization Admin
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin mx-auto mb-2" />
              <p className="text-sm text-[#A1A1B5]">Loading Registered Organizations...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-[#2A2A3D]">
              <Building2 className="w-12 h-12 text-[#6B6B7D] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No Registered Organizations Yet</h3>
              <p className="text-sm text-[#A1A1B5] max-w-md mx-auto mb-6">
                Click "Create Organization Admin" above to register your first subscribed hostel organization.
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-xl px-5 py-2.5 text-xs"
              >
                <Plus className="w-4 h-4 mr-2" /> Create First Organization
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <div
                  key={org._id}
                  className="rounded-2xl bg-[#14141F] border border-[#2A2A3D] p-6 flex flex-col justify-between hover:bg-[#1A1A28] transition-all shadow-black/40 shadow-lg"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md"
                          style={{ backgroundColor: org.branding?.primaryColor || "#6366F1" }}
                        >
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">{org.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-[#A1A1B5]">
                            <MapPin className="w-3.5 h-3.5 text-[#6B6B7D]" />
                            {org.location}
                          </div>
                        </div>
                      </div>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.05em] px-2.5 py-0.5 rounded-full bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/30">
                        {org.plan}
                      </span>
                    </div>

                    {/* Stats & Details */}
                    <div className="space-y-2 text-xs text-[#A1A1B5] bg-[#0A0A12] p-3.5 rounded-xl border border-[#2A2A3D] mb-4">
                      <div className="flex justify-between">
                        <span className="text-[#6B6B7D]">Route Slug:</span>
                        <span className="font-mono text-[#818CF8]">organization/{org.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B7D]">Subscription:</span>
                        <span className="text-[#10B981] font-semibold">{org.subscriptionStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B7D]">Admin Account:</span>
                        <span className="font-mono text-white truncate max-w-[160px]">
                          {org.adminEmail}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B7D]">Total Users:</span>
                        <span className="font-semibold text-white">{org.totalUsers || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#232334] flex items-center justify-between text-xs">
                    <span className="text-[#6B6B7D]">
                      Created: {new Date(org.createdDate || org.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-[#818CF8] bg-[#6366F1]/10 px-2.5 py-1 rounded-full border border-[#6366F1]/20 font-medium">
                      Provisioned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: Create Organization & Admin */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0A12]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141F] border border-[#2A2A3D] rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#232334] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1] flex items-center justify-center text-white font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create Organization & Admin</h3>
                  <p className="text-xs text-[#A1A1B5]">Issue credentials for new subscribed hostel</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#6B6B7D] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                    Hostel / Organization Name
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Royal Crown Hostel"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                      setFormData({ ...formData, name, slug });
                    }}
                    className="bg-black/30 border-white/10 text-white text-sm rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                    URL Slug (Route Path)
                  </Label>
                  <Input
                    required
                    placeholder="e.g. royal-crown"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-black/30 border-white/10 text-[#818CF8] font-mono text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                    Location (City)
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Bangalore"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-black/30 border-white/10 text-white text-sm rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                    Subscription Plan
                  </Label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                    className="w-full h-10 rounded-xl bg-[#0A0A12] border border-white/10 text-white text-sm px-3 focus:outline-none"
                  >
                    <option value="Basic">Basic Plan</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                    Subscription Status
                  </Label>
                  <select
                    value={formData.subscriptionStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, subscriptionStatus: e.target.value as any })
                    }
                    className="w-full h-10 rounded-xl bg-[#0A0A12] border border-white/10 text-white text-sm px-3 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Admin Credentials Panel */}
              <div className="p-4 rounded-xl bg-[#0A0A12] border border-[#2A2A3D] space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-[#818CF8]">
                  Admin Credentials
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#A1A1B5]">Admin Full Name</Label>
                    <Input
                      required
                      placeholder="John Doe"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="bg-black/30 border-white/10 text-white text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#A1A1B5]">Admin Email</Label>
                    <Input
                      required
                      type="email"
                      placeholder="admin@hostel.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="bg-black/30 border-white/10 text-white text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#A1A1B5]">Initial Password</Label>
                    <Input
                      required
                      type="text"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="bg-black/30 border-white/10 text-white font-mono text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B6B7D]">
                  Branding Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#A1A1B5]">Custom Tagline</Label>
                    <Input
                      placeholder="Tagline or slogan"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="bg-black/30 border-white/10 text-white text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#A1A1B5]">Primary Theme Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-12 h-9 p-1 bg-black/30 border-white/10 cursor-pointer rounded-xl"
                      />
                      <Input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="bg-black/30 border-white/10 text-white font-mono text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#232334]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="text-[#A1A1B5] hover:text-white rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold px-6 rounded-xl"
                >
                  {submitting ? "Creating..." : "Save & Issue Credentials"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
