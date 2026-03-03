// ============================================
// Admin Settings Page
// Configure rate limits, budgets, and system settings
// ============================================

'use client';

import { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    dailyBudgetLimit: 10,
    rateLimitPerIP: 10,
    maxPromptLength: 1000,
    apiTimeout: 15,
    maxResponseTokens: 1000,
    enableStreaming: true,
    enableVoting: true,
    maintenanceMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: Save to API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cyan-400 font-mono mb-1">
          &gt; Settings
        </h1>
        <p className="text-cyan-700 text-sm font-mono">
          Configure system parameters and limits
        </p>
      </div>

      {/* Cost Control Settings */}
      <div className="terminal-panel">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-orange-500">$</span>
          <h2 className="text-cyan-400 font-mono font-semibold">Cost Control</h2>
        </div>

        <div className="space-y-6">
          {/* Daily Budget */}
          <SettingRow
            label="Daily Budget Limit"
            description="Maximum daily spending on API calls (hard stop)"
            value={settings.dailyBudgetLimit}
            onChange={(v) => updateSetting('dailyBudgetLimit', v)}
            unit="USD"
            min={1}
            max={100}
            step={1}
          />

          {/* Max Response Tokens */}
          <SettingRow
            label="Max Response Tokens"
            description="Maximum tokens per model response (controls output length)"
            value={settings.maxResponseTokens}
            onChange={(v) => updateSetting('maxResponseTokens', v)}
            unit="tokens"
            min={100}
            max={4000}
            step={100}
          />

          {/* Cost Projection */}
          <div className="p-4 rounded border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-cyan-600">Projected Monthly Cost</span>
              <span className="text-cyan-400">${(settings.dailyBudgetLimit * 30).toFixed(0)}</span>
            </div>
            <p className="text-xs text-cyan-700 mt-1">
              Based on daily limit × 30 days. Actual may vary.
            </p>
          </div>
        </div>
      </div>

      {/* Rate Limiting Settings */}
      <div className="terminal-panel">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-cyan-500">◈</span>
          <h2 className="text-cyan-400 font-mono font-semibold">Rate Limiting</h2>
        </div>

        <div className="space-y-6">
          {/* Rate Limit Per IP */}
          <SettingRow
            label="Comparisons Per IP Per Day"
            description="Maximum comparisons allowed per IP address per 24 hours"
            value={settings.rateLimitPerIP}
            onChange={(v) => updateSetting('rateLimitPerIP', v)}
            unit="comparisons"
            min={1}
            max={100}
            step={1}
          />

          {/* Max Prompt Length */}
          <SettingRow
            label="Max Prompt Length"
            description="Maximum characters allowed in user prompts"
            value={settings.maxPromptLength}
            onChange={(v) => updateSetting('maxPromptLength', v)}
            unit="chars"
            min={100}
            max={10000}
            step={100}
          />

          {/* API Timeout */}
          <SettingRow
            label="API Timeout"
            description="Maximum seconds to wait for model responses"
            value={settings.apiTimeout}
            onChange={(v) => updateSetting('apiTimeout', v)}
            unit="seconds"
            min={5}
            max={60}
            step={5}
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="terminal-panel">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-cyan-500">⚙</span>
          <h2 className="text-cyan-400 font-mono font-semibold">Feature Toggles</h2>
        </div>

        <div className="space-y-4">
          <ToggleRow
            label="Enable Streaming"
            description="Show responses character-by-character animation"
            enabled={settings.enableStreaming}
            onChange={(v) => updateSetting('enableStreaming', v)}
          />

          <ToggleRow
            label="Enable Voting"
            description="Allow users to vote on comparisons"
            enabled={settings.enableVoting}
            onChange={(v) => updateSetting('enableVoting', v)}
          />

          <ToggleRow
            label="Maintenance Mode"
            description="Show maintenance page to all visitors"
            enabled={settings.maintenanceMode}
            onChange={(v) => updateSetting('maintenanceMode', v)}
            danger
          />
        </div>
      </div>

      {/* API Keys */}
      <div className="terminal-panel border-orange-500/30">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-orange-500">🔑</span>
          <h2 className="text-orange-400 font-mono font-semibold">API Keys</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded border border-cyan-500/20 bg-black/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyan-400 font-mono">OpenAI API Key</span>
              <span className="text-xs text-green-400 font-mono">● CONFIGURED</span>
            </div>
            <p className="text-xs text-cyan-700">
              Set via OPENAI_API_KEY environment variable
            </p>
          </div>

          <div className="p-4 rounded border border-cyan-500/20 bg-black/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyan-400 font-mono">Anthropic API Key</span>
              <span className="text-xs text-green-400 font-mono">● CONFIGURED</span>
            </div>
            <p className="text-xs text-cyan-700">
              Set via ANTHROPIC_API_KEY environment variable
            </p>
          </div>

          <div className="p-4 rounded border border-cyan-500/20 bg-black/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyan-400 font-mono">Supabase Service Key</span>
              <span className="text-xs text-green-400 font-mono">● CONFIGURED</span>
            </div>
            <p className="text-xs text-cyan-700">
              Set via SUPABASE_SERVICE_ROLE_KEY environment variable
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="terminal-panel border-red-500/30">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-red-500">⚠</span>
          <h2 className="text-red-400 font-mono font-semibold">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded border border-red-500/20 bg-red-500/5">
            <div>
              <p className="text-red-400 font-mono text-sm">Clear All Comparisons</p>
              <p className="text-xs text-red-700">Permanently delete all comparison data</p>
            </div>
            <button className="px-4 py-2 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono text-sm transition-colors">
              CLEAR DATA
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded border border-red-500/20 bg-red-500/5">
            <div>
              <p className="text-red-400 font-mono text-sm">Reset Rate Limits</p>
              <p className="text-xs text-red-700">Clear all IP-based rate limit counters</p>
            </div>
            <button className="px-4 py-2 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono text-sm transition-colors">
              RESET LIMITS
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded border border-red-500/20 bg-red-500/5">
            <div>
              <p className="text-red-400 font-mono text-sm">Clear Cache</p>
              <p className="text-xs text-red-700">Invalidate all cached responses</p>
            </div>
            <button className="px-4 py-2 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono text-sm transition-colors">
              CLEAR CACHE
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saved && (
            <span className="text-green-400 font-mono text-sm flex items-center gap-2">
              <span>✓</span>
              <span>Settings saved successfully</span>
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className="btn-cyber"
        >
          <span>SAVE_SETTINGS</span>
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}

// Setting Row Component with Slider
function SettingRow({
  label,
  description,
  value,
  onChange,
  unit,
  min,
  max,
  step,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-sm text-cyan-300 font-mono">{label}</label>
          <p className="text-xs text-cyan-700">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-cyan-400 font-mono text-sm text-right"
            min={min}
            max={max}
            step={step}
          />
          <span className="text-xs text-cyan-600 font-mono w-16">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-cyan-900/30 appearance-none cursor-pointer accent-cyan-400"
      />
      <div className="flex justify-between text-xs text-cyan-700 font-mono mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// Toggle Row Component
function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  danger,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded border border-cyan-500/20 bg-black/20">
      <div>
        <label className={`text-sm font-mono ${danger ? 'text-red-400' : 'text-cyan-300'}`}>
          {label}
        </label>
        <p className="text-xs text-cyan-700">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          enabled 
            ? (danger ? 'bg-red-500' : 'bg-cyan-500') 
            : 'bg-cyan-900/30'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
            enabled ? 'left-8' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
