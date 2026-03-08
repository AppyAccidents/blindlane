'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

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

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <header className="border-l-4 border-primary pl-6">
        <h1 className="font-serif text-2xl font-black tracking-tight uppercase">Settings</h1>
        <p className="font-sans text-sm text-muted-foreground">Configure budget, limits, and operational flags.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSlider
              label="Daily Budget Limit"
              description="Maximum daily spending on model calls"
              value={settings.dailyBudgetLimit}
              min={1}
              max={100}
              step={1}
              unit="USD"
              onChange={(value) => updateSetting('dailyBudgetLimit', value)}
            />
            <SettingSlider
              label="Max Response Tokens"
              description="Maximum tokens generated per response"
              value={settings.maxResponseTokens}
              min={100}
              max={4000}
              step={100}
              unit="tokens"
              onChange={(value) => updateSetting('maxResponseTokens', value)}
            />
            <Badge variant="secondary">Projected monthly cap: ${(settings.dailyBudgetLimit * 30).toFixed(0)}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate and Prompt Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingSlider
              label="Comparisons Per IP / Day"
              description="Daily limit for each hashed IP"
              value={settings.rateLimitPerIP}
              min={1}
              max={100}
              step={1}
              unit="runs"
              onChange={(value) => updateSetting('rateLimitPerIP', value)}
            />
            <SettingSlider
              label="Max Prompt Length"
              description="Maximum prompt character count"
              value={settings.maxPromptLength}
              min={100}
              max={10000}
              step={100}
              unit="chars"
              onChange={(value) => updateSetting('maxPromptLength', value)}
            />
            <SettingSlider
              label="API Timeout"
              description="Max wait time per generation request"
              value={settings.apiTimeout}
              min={5}
              max={60}
              step={5}
              unit="sec"
              onChange={(value) => updateSetting('apiTimeout', value)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingSwitch
            label="Enable Streaming"
            description="Stream model responses in the UI"
            checked={settings.enableStreaming}
            onCheckedChange={(checked) => updateSetting('enableStreaming', checked)}
          />
          <SettingSwitch
            label="Enable Voting"
            description="Allow BETTER/TIE/SKIP voting on pairs"
            checked={settings.enableVoting}
            onCheckedChange={(checked) => updateSetting('enableVoting', checked)}
          />
          <SettingSwitch
            label="Maintenance Mode"
            description="Temporarily disable user-facing generation"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <EnvRow label="OPENAI_API_KEY" configured />
          <EnvRow label="ANTHROPIC_API_KEY" configured />
          <EnvRow label="GOOGLE_AI_API_KEY" configured />
          <EnvRow label="SUPABASE_SERVICE_ROLE_KEY" configured />
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Danger Zone</AlertTitle>
        <AlertDescription>Actions below are irreversible in production environments.</AlertDescription>
      </Alert>

      <div className="grid gap-3 lg:grid-cols-3">
        <DangerAction title="Clear All Comparisons" description="Delete all run and vote records." />
        <DangerAction title="Reset Rate Limits" description="Reset all per-IP counters and budgets." />
        <DangerAction title="Clear Cache" description="Invalidate cached stats and API responses." />
      </div>

      <div className="flex items-center justify-between">
        {saved ? <p className="text-sm text-primary">Settings saved.</p> : <span />}
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}

function SettingSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            min={min}
            max={max}
            step={step}
            className="w-24"
          />
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values: number[]) => onChange(values[0] ?? value)}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function SettingSwitch({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-2 border-slate-900 dark:border-slate-800 p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}

function EnvRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between border-2 border-slate-900 dark:border-slate-800 p-3 text-sm">
      <span className="font-mono">{label}</span>
      <Badge variant={configured ? 'secondary' : 'destructive'}>{configured ? 'Configured' : 'Missing'}</Badge>
    </div>
  );
}

function DangerAction({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-2 border-destructive">
      <CardContent className="space-y-3 pt-6">
        <div>
          <p className="text-sm font-medium text-destructive">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Run Action</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm action</AlertDialogTitle>
              <AlertDialogDescription>This operation cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
