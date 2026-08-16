import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Search,
  ArrowRight,
  Users,
  BedDouble,
  ScanLine,
  LogOut,
  CalendarClock,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/core/lib/api";
import { useAuth } from "@/core/context/auth-context";
import Header from "@/components/layout/Header";
import { Badge } from "@/core/components/ui/badge";
import { PricingComparison } from "../components/PricingComparison";

// Grounded in actual API_ENDPOINTS / modules — not invented marketing copy.
const FEATURES = [
  {
    icon: Users,
    title: "Student Directory",
    description: "Centralized profiles, academic records, and digital ID cards for every resident.",
  },
  {
    icon: BedDouble,
    title: "Room & Bed Management",
    description: "Visual block/floor/room hierarchy with real-time occupancy and transfer workflows.",
  },
  {
    icon: ScanLine,
    title: "Attendance Scanning",
    description: "QR-based mess attendance across breakfast, lunch, and dinner sessions.",
  },
  {
    icon: LogOut,
    title: "Gate Pass & Outings",
    description: "Scan-out/scan-in logging with live overdue-return tracking for security staff.",
  },
  {
    icon: CalendarClock,
    title: "Leave Management",
    description: "Structured approval workflow with automatic rebate-eligible day calculation.",
  },
  {
    icon: Receipt,
    title: "Billing & Payments",
    description: "Monthly bill generation, payment reconciliation, and outstanding-dues tracking.",
  },
] as const;

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>(["All"]);
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (role === "super_admin") {
        navigate("/super-admin", { replace: true });
      } else {
        const slug = user.organizationSlug || localStorage.getItem("tenant_slug") || "developer";
        navigate(`/organization/${slug}/dashboard`, { replace: true });
      }
    }
  }, [authLoading, user, role, navigate]);

  useEffect(() => {
    document.title = "Campus Stay - Multi-Tenant Hostel Management Platform";
    document.documentElement.style.removeProperty("--tenant-primary");
    document.documentElement.style.removeProperty("--tenant-secondary");
    document.documentElement.style.removeProperty("--tenant-primary-hover");
    document.documentElement.style.removeProperty("--tenant-primary-foreground");
    fetchInitialData();
    detectUserLocation();
  }, []);

  const detectUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.state_district ||
              "Unknown";

            const cityMap: { [key: string]: string } = {
              Bengaluru: "Bangalore",
              Bangalore: "Bangalore",
              Mumbai: "Mumbai",
              Hyderabad: "Hyderabad",
              "New Delhi": "Delhi",
              Delhi: "Delhi",
              Vizianagaram: "Vizianagaram",
            };

            setDetectedLocation(cityMap[city] || city);
          } catch (error) {
            console.warn("Error getting location details:", error);
            setDetectedLocation("Unknown");
          }
        },
        (error) => {
          console.warn("Geolocation position unavailable:", error.message || error);
          setDetectedLocation("Unknown");
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      setDetectedLocation("Unknown");
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const rawOrgs = await api.get<any[]>("/organizations/public", { noAuth: true });
      const orgList = Array.isArray(rawOrgs) ? rawOrgs : (rawOrgs as any)?.data || [];

      setOrganizations(orgList);
      setFilteredOrgs(orgList);

      try {
        const rawLocations = await api.get<any[]>("/organizations/public/locations", { noAuth: true });
        const fetchedLocs = Array.isArray(rawLocations) ? rawLocations : (rawLocations as any)?.data || [];
        const orgLocs = orgList.map((o: any) => o.location).filter(Boolean);
        const combined = Array.from(new Set([...fetchedLocs, ...orgLocs].map((l: string) => l.trim())));
        setLocations(["All", ...combined]);
      } catch {
        const orgLocs = Array.from(new Set(orgList.map((o: any) => o.location).filter(Boolean)));
        setLocations(["All", ...(orgLocs as string[])]);
      }
    } catch (err) {
      console.error("Failed to load public organizations:", err);
      setOrganizations([]);
      setFilteredOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (orgs: any[], location: string, search: string) => {
    let result = orgs;
    if (location !== "All") {
      result = result.filter(
        (org) => org.location && org.location.toLowerCase() === location.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (org) =>
          org.name?.toLowerCase().includes(q) ||
          org.location?.toLowerCase().includes(q) ||
          org.slug?.toLowerCase().includes(q)
      );
    }
    setFilteredOrgs(result);
  };

  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc);
    applyFilters(organizations, loc, searchTerm);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    applyFilters(organizations, selectedLocation, term);
  };

  const scrollToDirectory = () => {
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const orgCount = organizations.length;
  const blockCount = organizations.reduce((sum, o) => sum + (o.blockCount || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col font-sans transition-colors duration-200">
      <Header />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--tenant-primary) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--tenant-primary)" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="max-w-2xl space-y-6">
            <Badge variant="pro" size="sm" className="inline-flex">
              Enterprise Multi-Tenant Platform
            </Badge>

            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
              Hostel operations, run from{" "}
              <span className="text-[var(--tenant-primary)]">one platform</span>.
            </h1>

            <p className="font-body text-sm md:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Campus Stay gives colleges and universities a single system for student records,
              room allocation, mess attendance, gate passes, leaves, and billing — with strict
              data isolation between every hostel that runs on it.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToDirectory}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--tenant-primary)] text-[var(--tenant-primary-foreground)] px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Find your hostel <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="mailto:hello@campusstay.app"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--text-primary)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--color-border-strong)] transition-colors"
              >
                Bring Campus Stay to your campus
              </a>
            </div>

            {/* Real derived stats */}
            {!loading && orgCount > 0 && (
              <div className="flex items-center gap-6 pt-4 text-xs text-[var(--text-muted)]">
                <span>
                  <strong className="text-[var(--text-primary)] font-semibold">{orgCount}</strong>{" "}
                  institutions onboarded
                </span>
                {blockCount > 0 && (
                  <span>
                    <strong className="text-[var(--text-primary)] font-semibold">{blockCount}</strong>{" "}
                    hostel blocks managed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= CAPABILITIES ================= */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-16">
        <div className="max-w-xl mb-8">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Everything a hostel admin office needs
          </h2>
          <p className="font-body text-sm text-[var(--text-secondary)] mt-2">
            Six operational modules, one shared data model, zero spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--tenant-primary)]/40 hover:shadow-sm transition-all"
            >
              <div className="h-9 w-9 rounded-lg grid place-items-center bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] mb-3">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-h3 text-sm font-bold text-[var(--text-primary)]">{title}</h3>
              <p className="font-small text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TRUST / ISOLATION STRIP ================= */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-sunken)]/50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-lg grid place-items-center bg-[var(--color-success)]/10 text-[var(--color-success)]">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <span className="font-h3 text-sm font-bold text-[var(--text-primary)]">
              Strict tenant isolation
            </span>
          </div>
          <p className="font-small text-xs text-[var(--text-secondary)] leading-relaxed">
            Every organization on Campus Stay runs on its own scoped data boundary — one
            institution's students, bills, and records are never visible to another, even
            within the same infrastructure.
          </p>
        </div>
      </section>

      {/* ================= DIRECTORY ================= */}
      <main id="directory" className="flex-1 max-w-6xl w-full mx-auto px-4 py-14 md:py-16 space-y-8">
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Find your hostel
            </h2>
            <p className="font-body text-xs md:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Select your university or residence hall to access digital passes, mess
              attendance, and room allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative inline-block text-left">
              <select
                aria-label="Filter hostels by location"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="appearance-none bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-3 py-1.5 pr-8 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--color-border-strong)] focus:outline-hidden focus:ring-1 focus:ring-[var(--tenant-primary)] cursor-pointer shadow-2xs"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--color-surface)] text-[var(--text-primary)]">
                    {loc === "All" ? "All Locations" : loc}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-muted)]">
                <MapPin className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search hostel by name or city location..."
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-9 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] hover:border-[var(--color-border-strong)] focus:outline-hidden focus:ring-1 focus:ring-[var(--tenant-primary)] shadow-2xs transition-all"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              Subscribed Hostels ({filteredOrgs.length})
            </h3>
            {detectedLocation && detectedLocation !== "Unknown" && (
              <span className="font-small text-xs text-[var(--tenant-primary)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Near {detectedLocation}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse p-4 space-y-3"
                />
              ))}
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]/30">
              <Building2 className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="font-h3 text-sm text-[var(--text-primary)] font-semibold">
                No hostels found {selectedLocation !== "All" ? `in "${selectedLocation}"` : ""}
              </p>
              <p className="font-small text-xs text-[var(--text-muted)] mt-1">
                Try selecting "All Locations" or clear your search query
              </p>
              {selectedLocation !== "All" && (
                <button
                  onClick={() => handleLocationChange("All")}
                  className="mt-3 text-xs font-semibold text-[var(--tenant-primary)] hover:underline cursor-pointer"
                >
                  Show all registered hostels
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrgs.map((org) => {
                const primaryColor = org.branding?.primaryColor || "var(--tenant-primary)";
                const plan = (org.plan || "BASIC").toUpperCase();

                return (
                  <div
                    key={org._id || org.id || org.slug}
                    onClick={() => navigate(`/organization/${org.slug}/login`)}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--tenant-primary)] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {org.branding?.logoUrl ? (
                          <img
                            src={org.branding.logoUrl}
                            alt={org.name}
                            className="w-11 h-11 rounded-lg object-contain border border-[var(--color-border)] shrink-0 bg-white p-0.5"
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-lg grid place-items-center font-bold text-white text-sm shrink-0 shadow-xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {org.name ? org.name.charAt(0).toUpperCase() : "H"}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h3 className="font-body-medium text-sm text-[var(--text-primary)] truncate font-bold group-hover:text-[var(--tenant-primary)] transition-colors">
                            {org.name}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] mt-0.5">
                            <MapPin className="w-3 h-3 text-[var(--tenant-primary)] shrink-0" />
                            <span className="truncate">{org.location || "Main Campus"}</span>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={plan === "ENTERPRISE" ? "enterprise" : plan === "PRO" ? "pro" : "basic"}
                        size="sm"
                      >
                        {plan === "BASIC" ? "Free" : plan}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">/{org.slug}</span>
                      <span className="flex items-center gap-1 text-[var(--tenant-primary)] font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                        Access Portal <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= PRICING ================= */}
        <div className="pt-14 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Plan Features & Capabilities Comparison
            </h2>
            <p className="font-small text-xs text-[var(--text-secondary)] mt-1">
              Detailed tier specifications across Basic, Pro, and Enterprise multi-tenant deployments.
            </p>
          </div>

          <PricingComparison />
        </div>

        {/* ================= FINAL CTA ================= */}
        <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 md:px-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-lg">
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
              Ready to bring your hostel online?
            </h3>
            <p className="font-body text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              New institutions are onboarded by our team to configure tenant branding, quotas,
              and admin access. Reach out and we'll get your hostel provisioned.
            </p>
          </div>

          <a
            href="mailto:hello@campusstay.app"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--tenant-primary)] text-[var(--tenant-primary-foreground)] px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity shrink-0"
          >
            Contact us to get onboarded <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span>© {new Date().getFullYear()} Campus Stay. All rights reserved.</span>
          <span>Enterprise multi-tenant hostel management platform.</span>
        </div>
      </footer>
    </div>
  );
}