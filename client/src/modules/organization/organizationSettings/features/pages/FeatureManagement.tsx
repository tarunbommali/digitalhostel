import React, { useState, useMemo } from 'react';
import { useOrganization } from '@/core/context/tenant-context';
import { FEATURE_REGISTRY } from '@/core/features/feature-registry';
import { FeatureDefinition, FeatureCategory } from '@/core/types/feature.types';
import {
  Search,
  CheckCircle,
  XCircle,
  Lock,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Card } from '@/core/components/ui/card';
import { PageHeader } from '@/core/components/ui/PageHeader';
import { FeatureConfigModal } from '../components/FeatureConfigModal';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export interface FeatureManagementProps {
  hideHeader?: boolean;
}

export const FeatureManagement: React.FC<FeatureManagementProps> = ({ hideHeader = false }) => {
  const { organization, isFeatureEnabled, updateFeature } = useOrganization();
  const { slug } = useParams<{ slug?: string }>();
  const basePath = slug ? `/organization/${slug}` : '';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FeatureCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedFeature, setSelectedFeature] = useState<FeatureDefinition | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const filteredFeatures = useMemo(() => {
    return FEATURE_REGISTRY.filter((feature) => {
      // Search filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = feature.name.toLowerCase().includes(q);
        const matchesDesc = feature.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // Category filter
      if (filterCategory !== 'all' && feature.category !== filterCategory) {
        return false;
      }

      // Status filter
      const enabled = isFeatureEnabled(feature.id);
      if (filterStatus === 'enabled' && !enabled) return false;
      if (filterStatus === 'disabled' && enabled) return false;

      return true;
    });
  }, [searchTerm, filterCategory, filterStatus, isFeatureEnabled]);

  const handleToggleFeature = async (feature: FeatureDefinition) => {
    if (feature.isCore) {
      toast.info('Core operational features cannot be disabled');
      return;
    }

    const currentEnabled = isFeatureEnabled(feature.id);

    // Check dependencies
    if (currentEnabled) {
      // Check if any other enabled feature depends on this one
      const dependentFeatures = FEATURE_REGISTRY.filter(
        (f) => f.dependencies.includes(feature.id) && isFeatureEnabled(f.id)
      );

      if (dependentFeatures.length > 0) {
        const dependentNames = dependentFeatures.map((f) => f.name).join(', ');
        const confirmed = window.confirm(
          `Disabling "${feature.name}" will also affect dependent modules:\n\n${dependentNames}\n\nDo you want to proceed?`
        );
        if (!confirmed) return;
      }
    }

    try {
      await updateFeature(feature.id, {
        enabled: !currentEnabled,
      });
    } catch {
      // Toast notification already dispatched in context
    }
  };

  const getStatusBadge = (feature: FeatureDefinition) => {
    if (feature.isCore) {
      return (
        <Badge variant="brand" size="sm" className="gap-1">
          <Lock className="w-3 h-3" /> Core
        </Badge>
      );
    }

    const enabled = isFeatureEnabled(feature.id);
    return enabled ? (
      <Badge variant="success" size="sm" className="gap-1">
        <CheckCircle className="w-3 h-3" /> Enabled
      </Badge>
    ) : (
      <Badge variant="neutral" size="sm" className="gap-1">
        <XCircle className="w-3 h-3" /> Disabled
      </Badge>
    );
  };

  const getCategoryLabel = (category: FeatureCategory): string => {
    const labels: Record<FeatureCategory, string> = {
      core: 'Core',
      accommodation: 'Accommodation',
      operations: 'Operations',
      finance: 'Finance',
      communication: 'Communication',
      facilities: 'Facilities',
      analytics: 'Analytics',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      {!hideHeader && (
        <PageHeader
          eyebrow="Organization Settings"
          title="Features & Modules"
          description="Configure the operational SaaS modules available to your organization. Enabling or disabling tools dynamically adapts navigation and dashboard views."
          breadcrumbs={[
            { label: organization?.name || 'Hostel', to: `${basePath}/dashboard` },
            { label: 'Organization Settings', to: `${basePath}/settings/general` },
            { label: 'Features & Modules' },
          ]}
        />
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-md pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--tenant-primary)] transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--tenant-primary)]"
          >
            <option value="all">All Categories</option>
            {['core', 'accommodation', 'operations', 'finance', 'communication', 'facilities', 'analytics'].map(
              (cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat as FeatureCategory)}
                </option>
              )
            )}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-9 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--tenant-primary)]"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Feature List */}
      <div className="space-y-3">
        {filteredFeatures.length === 0 && (
          <div className="text-center py-12 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl">
            <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
            <p className="text-xs text-[var(--text-muted)]">No feature modules match your current search filters.</p>
          </div>
        )}

        {filteredFeatures.map((feature) => {
          const enabled = isFeatureEnabled(feature.id);
          const hasDependencies = feature.dependencies.length > 0;
          const allDepsEnabled = feature.dependencies.every((depId) => isFeatureEnabled(depId));

          return (
            <Card
              key={feature.id}
              className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)]">{feature.name}</h3>
                    {getStatusBadge(feature)}
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">
                      {getCategoryLabel(feature.category)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{feature.description}</p>

                  {/* Dependencies */}
                  {hasDependencies && (
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--text-muted)]">
                      <span>Requires:</span>
                      {feature.dependencies.map((depId) => {
                        const dep = FEATURE_REGISTRY.find((f) => f.id === depId);
                        const depEnabled = isFeatureEnabled(depId);
                        return (
                          <span
                            key={depId}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              depEnabled
                                ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                                : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                            }`}
                          >
                            {dep?.name || depId} {depEnabled ? '✓' : '✗'}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  {!feature.isCore && (
                    <Button
                      variant={enabled ? 'destructive' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleFeature(feature)}
                      disabled={!allDepsEnabled}
                      className="text-xs h-8"
                    >
                      {enabled ? 'Disable Module' : 'Enable Module'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFeature(feature);
                      setConfigModalOpen(true);
                    }}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Settings className="w-3.5 h-3.5" /> Configure
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Config Modal */}
      <FeatureConfigModal
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setSelectedFeature(null);
        }}
        feature={selectedFeature}
        onSave={async (config) => {
          if (selectedFeature) {
            await updateFeature(selectedFeature.id, config);
          }
        }}
      />
    </div>
  );
};

export default FeatureManagement;
