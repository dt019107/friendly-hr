import React, { useState } from 'react';
import { Building2, Check, Factory, MapPin, Upload } from 'lucide-react';
import { useHRStore } from '../../store/useHRStore';
import { cn } from '../../lib/format';
import { Button, Card, PageHeader } from '../ui/Primitives';
import type { IndianState } from '../../types/hr';

export const OnboardingScreen: React.FC = () => {
  const { company, completeOnboarding, importEmployees } = useHRStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [companyName, setCompanyName] = useState(company.companyName);
  const [plantLocation, setPlantLocation] = useState(company.plantLocation);
  const [state, setState] = useState<IndianState>(company.state);
  const [industry, setIndustry] = useState<'SaaS / Product' | 'IT Services' | 'AI & Cloud'>(company.industry);
  const [csvImported, setCsvImported] = useState(false);

  const handleSampleImport = () => {
    importEmployees([
      {
        empCode: 'NX-1901',
        name: 'Siddharth Nair',
        role: 'Staff Architect',
        department: 'Engineering',
        shift: 'Hybrid',
        employmentType: 'Full-Time',
        tenureMonths: 18,
        basicSalary: 88000,
        hra: 35200,
        allowances: 22000,
        status: 'Active',
        state,
        phone: '+91 9811901001',
        email: 'siddharth.n@nexorasystems.in',
        joinedAt: '2025-05-01',
        uan: '100988776655',
        performance: 'Good',
      },
      {
        empCode: 'NX-1902',
        name: 'Ishita Deshmukh',
        role: 'QA Automation Lead',
        department: 'QA & DevOps',
        shift: 'US Overlap',
        employmentType: 'Contractor',
        contractorName: 'Apex Tech Consultants',
        tenureMonths: 3,
        basicSalary: 64000,
        hra: 25600,
        allowances: 16000,
        status: 'Active',
        state,
        phone: '+91 9811901002',
        email: 'ishita.d@nexorasystems.in',
        joinedAt: '2026-08-15',
        uan: '100988776656',
        performance: 'Good',
      },
    ]);
    setCsvImported(true);
  };

  const handleFinish = () => {
    completeOnboarding({
      companyName,
      plantLocation,
      state,
      industry,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <PageHeader
        title="15-Minute Workspace Setup"
        subtitle="Configure company details, state statutory rules, and initial engineering roster"
      />

      {/* Stepper */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { n: 1, label: 'Company' },
          { n: 2, label: 'State Rules' },
          { n: 3, label: 'Template' },
          { n: 4, label: 'Import CSV' },
        ].map((item) => (
          <div
            key={item.n}
            aria-current={step === item.n ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium',
              step === item.n
                ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                : step > item.n
                  ? 'border-transparent bg-[#00b473]/15 text-[#008f5b] dark:text-[#00b473]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)]'
            )}
          >
            {step > item.n ? <Check className="h-3.5 w-3.5" /> : <span>{item.n}.</span>}
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />
              Company &amp; Plant Unit
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Plant / Industrial Area
              </label>
              <input
                type="text"
                value={plantLocation}
                onChange={(e) => setPlantLocation(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-3 text-sm"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                disabled={!companyName.trim() || !plantLocation.trim()}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              Select State for Statutory Rules (PF / ESI / PT / LWF)
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { s: 'Karnataka', desc: 'Bengaluru ORR · ₹200/mo PT · EPFO Koramangala' },
                  { s: 'Haryana', desc: 'Gurugram Cyber City · ₹0 PT · 0.2% LWF (cap ₹31)' },
                  { s: 'Maharashtra', desc: 'Pune Hinjewadi · ₹200/mo PT · PoSH IC Register' },
                ] as const
              ).map((item) => (
                <button
                  key={item.s}
                  type="button"
                  onClick={() => setState(item.s)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    state === item.s
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-hairline)] hover:bg-[var(--bg-raised)]'
                  )}
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{item.s}</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">{item.desc}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Factory className="h-4 w-4 text-[var(--accent)]" />
              Industry Compliance Template
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: 'SaaS / Product', desc: 'Hybrid/Remote squads, ESOP & Form 12BB tracking' },
                  { id: 'IT Services', desc: 'SOW contractor renewals, US Overlap & client billing' },
                  { id: 'AI & Cloud', desc: '24×7 SRE on-call Comp-Off & PoSH compliance' },
                ] as const
              ).map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setIndustry(tpl.id)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    industry === tpl.id
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-hairline)] hover:bg-[var(--bg-raised)]'
                  )}
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{tpl.id}</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">{tpl.desc}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="primary" onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Upload className="h-4 w-4 text-[var(--accent)]" />
              Seed or Import Workforce Roster
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Your workspace is pre-seeded with 200 manufacturing workers. You can also append a sample batch right now.
            </p>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-raised)]/50 p-4">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {csvImported ? 'Sample batch imported (+2 workers)' : 'Import 2 sample workers'}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Adds 1 Machining permanent + 1 Night-shift contract worker
                </div>
              </div>
              <Button
                variant={csvImported ? 'secondary' : 'primary'}
                size="sm"
                disabled={csvImported}
                onClick={handleSampleImport}
              >
                {csvImported ? 'Imported' : 'Import sample'}
              </Button>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button variant="primary" onClick={handleFinish}>
                Launch Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
