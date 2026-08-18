import React, { useState, useEffect } from 'react';
import { FeatureDefinition, FeatureConfig } from '@/core/types/feature.types';
import { useOrganization } from '@/core/context/tenant-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { Button } from '@/core/components/ui/button';
import { Label } from '@/core/components/ui/label';
import { Input } from '@/core/components/ui/input';
import { Switch } from '@/core/components/ui/switch';

interface FeatureConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureDefinition | null;
  onSave: (config: Partial<FeatureConfig>) => Promise<void>;
}

export const FeatureConfigModal: React.FC<FeatureConfigModalProps> = ({
  isOpen,
  onClose,
  feature,
  onSave,
}) => {
  const { getFeatureConfig } = useOrganization();
  const [config, setConfig] = useState<FeatureConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (feature && isOpen) {
      const currentConfig = getFeatureConfig(feature.id);
      setConfig(currentConfig ? JSON.parse(JSON.stringify(currentConfig)) : JSON.parse(JSON.stringify(feature.defaultConfig)));
    }
  }, [feature, isOpen, getFeatureConfig]);

  if (!feature || !config) return null;

  const renderConfigFields = () => {
    switch (feature.id) {
      case 'attendance':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[var(--text-primary)]">Meals to Track</Label>
              <div className="flex gap-4 text-xs text-[var(--text-primary)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.settings?.meals?.breakfast ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings,
                          meals: { ...config.settings?.meals, breakfast: e.target.checked },
                        },
                      })
                    }
                    className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                  />
                  Breakfast
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.settings?.meals?.lunch ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings,
                          meals: { ...config.settings?.meals, lunch: e.target.checked },
                        },
                      })
                    }
                    className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                  />
                  Lunch
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.settings?.meals?.dinner ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings,
                          meals: { ...config.settings?.meals, dinner: e.target.checked },
                        },
                      })
                    }
                    className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                  />
                  Dinner
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[var(--text-primary)]">Attendance Modes</Label>
              <div className="flex gap-4 text-xs text-[var(--text-primary)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.settings?.modes?.qrScanner ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings,
                          modes: { ...config.settings?.modes, qrScanner: e.target.checked },
                        },
                      })
                    }
                    className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                  />
                  QR Scanner
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.settings?.modes?.manualUid ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        settings: {
                          ...config.settings,
                          modes: { ...config.settings?.modes, manualUid: e.target.checked },
                        },
                      })
                    }
                    className="rounded border-[var(--color-border)] text-[var(--tenant-primary)]"
                  />
                  Manual UID
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-primary)]">Late Threshold (minutes)</Label>
              <Input
                type="number"
                value={config.settings?.lateThreshold ?? 15}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, lateThreshold: parseInt(e.target.value, 10) || 0 },
                  })
                }
                className="w-32 h-8 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={config.settings?.studentVisibility ?? true}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, studentVisibility: checked },
                  })
                }
              />
              <Label className="text-xs text-[var(--text-primary)]">Students can view personal attendance records</Label>
            </div>
          </div>
        );

      case 'outings':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={config.settings?.qrScanner ?? true}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, qrScanner: checked },
                  })
                }
              />
              <Label className="text-xs text-[var(--text-primary)]">Enable QR Scanner for gate pass verification</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={config.settings?.parentNotification ?? false}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, parentNotification: checked },
                  })
                }
              />
              <Label className="text-xs text-[var(--text-primary)]">Send parent SMS / email notification on gate pass movement</Label>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-primary)]">Max Outings per Day</Label>
              <Input
                type="number"
                value={config.settings?.maxOutingsPerDay ?? 3}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, maxOutingsPerDay: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="w-32 h-8 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={config.settings?.requiresApproval ?? true}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, requiresApproval: checked },
                  })
                }
              />
              <Label className="text-xs text-[var(--text-primary)]">Require Warden approval before student gate departure</Label>
            </div>
          </div>
        );

      case 'finance':
      case 'billing':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={config.settings?.onlinePayments ?? true}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, onlinePayments: checked },
                  })
                }
              />
              <Label className="text-xs text-[var(--text-primary)]">Enable online payments & automated settlements</Label>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-primary)]">Late Fee Amount (₹)</Label>
              <Input
                type="number"
                value={config.settings?.lateFee ?? 100}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, lateFee: parseInt(e.target.value, 10) || 0 },
                  })
                }
                className="w-32 h-8 text-xs bg-[var(--color-surface-sunken)] border-[var(--color-border)]"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2 py-2">
            <p className="text-xs text-[var(--text-muted)]">
              This module operates on standard platform configuration defaults. Role-based permissions are managed under Staff Management.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--text-primary)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            Configure {feature.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            {feature.description}
          </p>

          <div className="py-2 border-y border-[var(--color-border)]">
            {renderConfigFields()}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                setLoading(true);
                try {
                  await onSave(config);
                  onClose();
                } catch {
                  // Error handled in context
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
