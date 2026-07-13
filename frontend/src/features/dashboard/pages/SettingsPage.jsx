import React, { useState } from "react";
import { Shield, KeyRound, Lock, EyeOff, Save, CheckCircle, HelpCircle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * Super Admin Settings panel managing role permissions, session bounds, and encryption details.
 */
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Role-based Permission Matrix State
  const [permissions, setPermissions] = useState({
    create_bills: { name: "Create & Edit Bills", DATA_ENTRY: true, SUPERVISOR: false, DEPARTMENT_MANAGER: false, ACCOUNTS: false },
    assign_depts: { name: "Assign Store Departments", DATA_ENTRY: true, SUPERVISOR: true, DEPARTMENT_MANAGER: false, ACCOUNTS: false },
    approve_transition: { name: "Authorize Step Transitions", DATA_ENTRY: false, SUPERVISOR: true, DEPARTMENT_MANAGER: true, ACCOUNTS: true },
    reject_bills: { name: "Execute Step Rejections", DATA_ENTRY: false, SUPERVISOR: true, DEPARTMENT_MANAGER: true, ACCOUNTS: true },
    view_audit: { name: "View System Audit Trails", DATA_ENTRY: true, SUPERVISOR: true, DEPARTMENT_MANAGER: true, ACCOUNTS: true },
    export_reports: { name: "Export Financial Reports", DATA_ENTRY: false, SUPERVISOR: false, DEPARTMENT_MANAGER: true, ACCOUNTS: true },
  });

  // 2. Security Configurations
  const [security, setSecurity] = useState({
    enforceMfa: true,
    passExpiry: "90",
    maxAttempts: "5",
    sessionTimeout: "30",
  });

  // 3. Privacy Options
  const [privacy, setPrivacy] = useState({
    maskPii: true,
    dataRetention: "3",
    encryptBackups: true,
  });

  const handlePermissionChange = (permKey, role) => {
    setPermissions((prev) => ({
      ...prev,
      [permKey]: {
        ...prev[permKey],
        [role]: !prev[permKey][role],
      },
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Settings" },
  ];

  return (
    <div className="space-y-6 font-sans antialiased text-zinc-900 select-none max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title="System Settings"
        subtitle="Configure access control matrix, session parameters, and data compliance rules."
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer gap-2 shadow-sm">
            <Save className="size-4" />
            <span>{isSaving ? "Saving Config..." : "Save Settings"}</span>
          </Button>
        }
      />

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="size-4 text-emerald-600" />
          <span>System configuration thresholds and permissions updated successfully.</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-200">
        {[
          { id: "permissions", name: "Access Matrix", icon: Shield },
          { id: "security", name: "Session & Auth", icon: KeyRound },
          { id: "privacy", name: "Data & Privacy", icon: EyeOff },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs tracking-wide uppercase transition-all cursor-pointer
                ${activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-450 hover:text-zinc-800"
                }
              `}
            >
              <Icon className="size-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6">
        
        {/* Tab 1: Access Control Matrix */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900">Role Permissions Mapping</h3>
              <p className="text-xs text-zinc-450 font-medium">Define which system operations each employee role can execute inside workflow pipelines.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-250/50">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold tracking-wider uppercase text-[10px]">
                    <th className="p-4 w-1/3">Privilege Scope</th>
                    <th className="p-4 text-center">Data Entry</th>
                    <th className="p-4 text-center">Supervisor</th>
                    <th className="p-4 text-center">Manager</th>
                    <th className="p-4 text-center">Accounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {Object.entries(permissions).map(([key, row]) => (
                    <tr key={key} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4 font-bold text-zinc-900">{row.name}</td>
                      {["DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"].map((role) => (
                        <td key={role} className="p-4 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={row[role]}
                              onCheckedChange={() => handlePermissionChange(key, role)}
                              aria-label={`Toggle ${row.name} for ${role}`}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200/60 flex items-start gap-2.5">
              <Lock className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-zinc-900 block">Root System Administrator Exclusion</span>
                <span className="text-[10px] text-zinc-400 font-semibold block leading-normal">
                  Super Admins bypass this authorization matrix and maintain absolute control across all departments.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Session Boundaries */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900">Auth & Session Rules</h3>
              <p className="text-xs text-zinc-450 font-medium">Configure brute-force lock limits and active session lifespans to secure corporate data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Enforce MFA */}
              <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200/60 rounded-xl">
                <Checkbox
                  id="enforceMfa"
                  checked={security.enforceMfa}
                  onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, enforceMfa: !!checked }))}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="enforceMfa" className="text-xs font-bold text-zinc-900 cursor-pointer block">
                    Enforce Multi-Factor Authentication (MFA)
                  </Label>
                  <p className="text-[10px] text-zinc-400 font-semibold leading-normal">
                    Require OTP verification codes sent via work email addresses on login.
                  </p>
                </div>
              </div>

              {/* Max failed attempts */}
              <div className="space-y-2">
                <Label htmlFor="maxAttempts" className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                  <span>Failed Login Lockout Limit</span>
                  <HelpCircle className="size-3.5 text-zinc-400" title="Lock user profiles after continuous invalid passwords" />
                </Label>
                <select
                  id="maxAttempts"
                  value={security.maxAttempts}
                  onChange={(e) => setSecurity(prev => ({ ...prev, maxAttempts: e.target.value }))}
                  className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                >
                  <option value="3">3 Attempts (Highest Security)</option>
                  <option value="5">5 Attempts (Recommended)</option>
                  <option value="10">10 Attempts (Relaxed)</option>
                </select>
              </div>

              {/* Password Expiration */}
              <div className="space-y-2">
                <Label htmlFor="passExpiry" className="text-xs font-bold text-zinc-800">Password Expiration Lifespan</Label>
                <select
                  id="passExpiry"
                  value={security.passExpiry}
                  onChange={(e) => setSecurity(prev => ({ ...prev, passExpiry: e.target.value }))}
                  className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                >
                  <option value="30">Every 30 Days</option>
                  <option value="90">Every 90 Days (Recommended)</option>
                  <option value="180">Every 180 Days</option>
                  <option value="never">Never expire</option>
                </select>
              </div>

              {/* Idle Timeout */}
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-xs font-bold text-zinc-800">Idle Session Timeout Limit</Label>
                <select
                  id="sessionTimeout"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="60">1 Hour</option>
                  <option value="240">4 Hours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Data & Retention Compliance */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900">Privacy & Retention Compliance</h3>
              <p className="text-xs text-zinc-450 font-medium">Verify data masking scopes and backup schedules to remain compliant with privacy acts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Mask PII */}
              <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200/60 rounded-xl">
                <Checkbox
                  id="maskPii"
                  checked={privacy.maskPii}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, maskPii: !!checked }))}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="maskPii" className="text-xs font-bold text-zinc-900 cursor-pointer block">
                    Mask Employee PII inside Audit Logs
                  </Label>
                  <p className="text-[10px] text-zinc-400 font-semibold leading-normal">
                    Obfuscate phone numbers and personal emails inside public workflow history logs.
                  </p>
                </div>
              </div>

              {/* Encrypt database backup */}
              <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200/60 rounded-xl">
                <Checkbox
                  id="encryptBackups"
                  checked={privacy.encryptBackups}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, encryptBackups: !!checked }))}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="encryptBackups" className="text-xs font-bold text-zinc-900 cursor-pointer block">
                    AES-256 Database Backups Encryption
                  </Label>
                  <p className="text-[10px] text-zinc-400 font-semibold leading-normal">
                    Encrypted daily server dumps and archive copies saved on secure clouds.
                  </p>
                </div>
              </div>

              {/* Data retention policies */}
              <div className="space-y-2">
                <Label htmlFor="dataRetention" className="text-xs font-bold text-zinc-800">Archive cleared workflow logs after</Label>
                <select
                  id="dataRetention"
                  value={privacy.dataRetention}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, dataRetention: e.target.value }))}
                  className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                >
                  <option value="1">1 Year</option>
                  <option value="3">3 Years (Recommended)</option>
                  <option value="5">5 Years</option>
                  <option value="never">Never archive logs</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;
