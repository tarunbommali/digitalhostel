import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/core/lib/api";
import { Building2, MapPin, Search } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
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
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state_district ||
              "Unknown";

            const cityMap: { [key: string]: string } = {
              Bengaluru: "Bangalore",
              Bangalore: "Bangalore",
              Mumbai: "Mumbai",
              Hyderabad: "Hyderabad",
              "New Delhi": "Delhi",
              Delhi: "Delhi",
            };

            const mappedCity = cityMap[city] || city;
            setDetectedLocation(mappedCity);

            if (locations.includes(mappedCity)) {
              setSelectedLocation(mappedCity);
              fetchOrganizations(mappedCity);
            }
          } catch (error) {
            console.warn("Error getting location details:", error);
            setDetectedLocation("Unknown");
          }
        },
        (error) => {
          console.warn("Geolocation position unavailable:", error.message || error);
          setDetectedLocation("Unknown");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setDetectedLocation("Unknown");
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await api.get<string[]>("/organizations/public/locations", { noAuth: true });
      setLocations(["All", ...data]);
    } catch {
      setLocations(["All", "Bangalore", "Hyderabad", "Mumbai"]);
    }
    fetchOrganizations("All");
  };

  const fetchOrganizations = async (location: string) => {
    setLoading(true);
    try {
      const url =
        location === "All"
          ? "/organizations/public"
          : `/organizations/public?location=${encodeURIComponent(location)}`;
      const data = await api.get<any[]>(url, { noAuth: true });
      setOrganizations(data);
      setFilteredOrgs(data);
    } catch (e: any) {
      console.error("Failed to load organizations:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    fetchOrganizations(location);
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrgs(organizations);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(term) ||
          org.location.toLowerCase().includes(term) ||
          org.slug.toLowerCase().includes(term)
      );
      setFilteredOrgs(filtered);
    }
  }, [searchTerm, organizations]);

  const getBrandColor = (index: number) => {
    const colors = [
      "from-blue-600 to-indigo-700",
      "from-purple-600 to-pink-700",
      "from-emerald-600 to-teal-700",
      "from-[#6366F1] to-[#4F46E5]",
      "from-rose-600 to-pink-700",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#0A0A12] text-[#FFFFFF] flex flex-col font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Header */}
      <header className="h-[72px] border-b border-[#2A2A3D] bg-[#12121C] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Inside <span className="text-[#6366F1]">Home</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0A0A12] border border-white/10 rounded-xl px-3.5 py-2">
              <MapPin className="w-4 h-4 text-[#6366F1] shrink-0" />
              <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#6B6B7D] hidden sm:inline-block">
                LOCATION:
              </span>
              <div className="flex items-center gap-2">
                {detectedLocation && detectedLocation !== "Unknown" && (
                  <span className="text-xs text-[#6366F1] font-medium hidden sm:inline">
                    {detectedLocation}
                  </span>
                )}
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="bg-[#14141F] text-white">
                      {loc === "All" ? "All Locations" : loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="min-h-[90vh] max-w-[1280px] mx-auto px-6 py-8 w-full">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B7D] w-5 h-5" />
            <input
              type="text"
              placeholder="Search hostel by name or city location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12121C] border border-[#2A2A3D] rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-[#6B6B7D] focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
            />
          </div>
        </div>

        {/* List of Hostels Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              List of Hostels
              <span className="ml-3 text-sm font-normal text-[#6B6B7D]">
                ({filteredOrgs.length} {filteredOrgs.length === 1 ? "Available" : "Available"})
              </span>
            </h2>
            {detectedLocation && detectedLocation !== "Unknown" && (
              <div className="flex items-center gap-2 text-sm text-[#6366F1]">
                <MapPin className="w-4 h-4" />
                <span>Near {detectedLocation}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6366F1] border-t-transparent"></div>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-[#6B6B7D] mx-auto mb-4 opacity-50" />
              <p className="text-[#6B6B7D] text-lg">No hostels found in this location</p>
              <p className="text-[#6B6B7D] text-sm mt-2">Try changing your location or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrgs.map((org, index) => (
                <div
                  key={org._id || org.id || org.slug}
                  onClick={() => navigate(`/organization/${org.slug}/login`)}
                  className="bg-[#12121C] border border-[#2A2A3D] rounded-2xl overflow-hidden hover:border-[#6366F1] transition-all duration-300 cursor-pointer group shadow-lg"
                >
                  {/* Minimal Card Header */}
                  <div className={`h-24 bg-gradient-to-r ${getBrandColor(index)} relative p-5 flex items-center justify-between`}>
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300" />
                    <div className="relative z-10 flex items-center gap-3.5">
                      {org.branding?.logoUrl ? (
                        <img
                          src={org.branding.logoUrl}
                          alt={org.name}
                          className="w-11 h-11 rounded-xl object-cover border border-white/30 shadow-md"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 font-bold text-white text-lg">
                          {org.name ? org.name.charAt(0) : "H"}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-white truncate max-w-[220px]">
                          {org.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-white/90 mt-0.5 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{org.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}