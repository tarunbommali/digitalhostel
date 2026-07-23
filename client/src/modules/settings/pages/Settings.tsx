import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LookupManager } from "@/components/LookupManager";

export function SettingsPage() {
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem("flag_threshold");
    if (saved) {
      setThreshold(parseInt(saved, 10));
    }
  }, []);

  function save() {
    localStorage.setItem("flag_threshold", String(threshold));
    toast.success("Settings saved successfully");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage system thresholds, lookup collections, and configurations.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-lg">Flag Risk Threshold</h2>
        <p className="text-sm text-muted-foreground">
          Students with this many or more open flags are marked High Risk.
        </p>
        <div className="mt-4 flex gap-3 max-w-sm">
          <div className="flex-1 space-y-1">
            <Label>Threshold</Label>
            <Input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Card>

      <div className="pt-4 border-t">
        <LookupManager />
      </div>
    </div>
  );
}

export default SettingsPage;
