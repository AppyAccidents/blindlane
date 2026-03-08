import { CircleHelp, GitBranch, Globe, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const steps = [
  {
    step: '01',
    title: 'Enter Prompt',
    desc: 'Ask anything: writing, coding, analysis, or ideation.',
  },
  {
    step: '02',
    title: 'Random Assignment',
    desc: 'Models are assigned to anonymous draft labels before evaluation.',
  },
  {
    step: '03',
    title: 'Compare Outputs',
    desc: 'Review content quality side-by-side without model brand bias.',
  },
  {
    step: '04',
    title: 'Vote & Reveal',
    desc: 'After converge, model, variant, cost, and latency are revealed.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6">
      <header className="space-y-3">
        <Badge variant="secondary" className="inline-flex items-center gap-1">
          <CircleHelp className="h-3.5 w-3.5" />
          About BlindLane
        </Badge>
        <h1 className="font-serif text-4xl font-black tracking-tight uppercase border-l-4 border-primary pl-6">Blind AI Comparison, Editor-First</h1>
        <p className="text-sm text-muted-foreground">
          BlindLane removes brand bias from model evaluation by hiding identities until selection.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif uppercase">What is BlindLane?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            BlindLane is an editor-first workspace where one prompt generates 6 anonymous drafts from 3 providers
            (OpenAI, Anthropic, Google). You compare quality, not model names, then converge on the best draft.
          </p>
          <p>
            After convergence, identities and run telemetry are revealed so your decision stays unbiased.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remove Bias</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Blind evaluation helps teams judge output quality without preconceived model preferences.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Find What Wins</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Different models and variants win in different contexts. Blind comparisons expose that quickly.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif uppercase">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((item, index) => (
            <div key={item.step}>
              <div className="flex gap-3">
                <Badge className="h-7 min-w-7 justify-center">{item.step}</Badge>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              {index < steps.length - 1 ? <Separator className="mt-4" /> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">GPT-4o Mini</p>
              <p className="text-muted-foreground">OpenAI fast model for efficient generation.</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Claude 3.5 Haiku</p>
              <p className="text-muted-foreground">Anthropic fast model for concise reasoning tasks.</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Gemini 2.0 Flash</p>
              <p className="text-muted-foreground">Google fast model for versatile content generation.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing Transparency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>GPT-4o Mini</span>
              <span className="text-muted-foreground">$0.15 in / $0.60 out per 1M</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Claude 3.5 Haiku</span>
              <span className="text-muted-foreground">$0.25 in / $1.25 out per 1M</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Gemini 2.0 Flash</span>
              <span className="text-muted-foreground">$0.10 in / $0.40 out per 1M</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Globe className="h-4 w-4" />
        <AlertTitle>Open Source</AlertTitle>
        <AlertDescription>
          Inspect the codebase, run it locally, or contribute improvements.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <a href="https://github.com/AppyAccidents/blindlane" target="_blank" rel="noopener noreferrer">
            <GitBranch className="mr-2 h-4 w-4" />
            View on GitHub
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href="/">
            <Zap className="mr-2 h-4 w-4" />
            Start Comparing
          </a>
        </Button>
      </div>

    </div>
  );
}
