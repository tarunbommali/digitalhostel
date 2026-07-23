import { Input } from "@/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";

export const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91 (IN)" },
  { code: "+1", label: "🇺🇸 +1 (US)" },
  { code: "+44", label: "🇬🇧 +44 (UK)" },
  { code: "+971", label: "🇦🇪 +971 (UAE)" },
  { code: "+61", label: "🇦🇺 +61 (AU)" },
  { code: "+65", label: "🇸🇬 +65 (SG)" },
];

interface PhoneInputProps {
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneDigits: string;
  setPhoneDigits: (digits: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({
  countryCode,
  setCountryCode,
  phoneDigits,
  setPhoneDigits,
  placeholder = "9876543210",
  disabled = false,
}: PhoneInputProps) {
  return (
    <div className="flex gap-2">
      <Select
        value={countryCode}
        onValueChange={setCountryCode}
        disabled={disabled}
      >
        <SelectTrigger className="w-[110px] shrink-0 font-mono text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={10}
        placeholder={placeholder}
        value={phoneDigits}
        disabled={disabled}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/\D/g, "");
          setPhoneDigits(cleaned);
        }}
      />
    </div>
  );
}
