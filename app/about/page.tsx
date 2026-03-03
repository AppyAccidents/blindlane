// ============================================
// About Page
// Explains what BlindLane is and how it works
// ============================================

import { EyeOff, Trophy, DollarSign, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
          About BlindLane
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The fair way to compare AI language models
        </p>
      </div>

      {/* What is BlindLane? */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          What is BlindLane?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          BlindLane is a blind comparison tool for AI language models. Like the famous 
          Pepsi Challenge, we hide which model is which so you can judge responses 
          purely on quality—without brand bias.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          You enter a prompt, two AI models respond anonymously, and you vote for the 
          better one. Only after voting do we reveal which model was which.
        </p>
      </section>

      {/* Why Blind Testing Matters */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Why Blind Testing?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <EyeOff className="mb-3 h-8 w-8 text-blue-600" />
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Remove Bias
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              People have strong opinions about AI brands. Blind testing ensures 
              you're judging the response, not the logo.
            </p>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Trophy className="mb-3 h-8 w-8 text-purple-600" />
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Find the Best
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Different models excel at different tasks. Blind testing helps you 
              discover which works best for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          How It Works
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              1
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Enter Your Prompt
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Ask anything—creative writing, coding help, analysis, or casual chat.
              </p>
            </div>
          </li>
          
          <li className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              2
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Random Assignment
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We randomly assign each model to "A" or "B". Even we don't know 
                which is which until you vote.
              </p>
            </div>
          </li>
          
          <li className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              3
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Compare Responses
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Read both responses side by side. Which is more helpful? More accurate? 
                Better written?
              </p>
            </div>
          </li>
          
          <li className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              4
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Vote & Reveal
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Pick your winner, then see which model you chose. Check the leaderboard 
                to see which AI is winning overall.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Current Models */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Current Models
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              GPT-4o Mini
            </h3>
            <p className="mb-3 text-sm text-slate-500">by OpenAI</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A fast, affordable model that's great for everyday tasks. Good balance 
              of speed and quality.
            </p>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
              Claude 3.5 Haiku
            </h3>
            <p className="mb-3 text-sm text-slate-500">by Anthropic</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Anthropic's fastest model, known for nuanced responses and strong 
              reasoning abilities.
            </p>
          </div>
        </div>
      </section>

      {/* Cost Transparency */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Cost Transparency
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Open Pricing
            </h3>
          </div>
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            We show you exactly how much each comparison costs. No hidden fees, 
            no markup. You see the real API costs.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2 text-left font-medium text-slate-900 dark:text-white">
                    Model
                  </th>
                  <th className="pb-2 text-right font-medium text-slate-900 dark:text-white">
                    Input (per 1M tokens)
                  </th>
                  <th className="pb-2 text-right font-medium text-slate-900 dark:text-white">
                    Output (per 1M tokens)
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-400">
                <tr>
                  <td className="py-2">GPT-4o Mini</td>
                  <td className="py-2 text-right">$0.15</td>
                  <td className="py-2 text-right">$0.60</td>
                </tr>
                <tr>
                  <td className="py-2">Claude 3.5 Haiku</td>
                  <td className="py-2 text-right">$0.25</td>
                  <td className="py-2 text-right">$1.25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Privacy & Data
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              What We Store
            </h3>
          </div>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li>• Your prompts (to show you your history)</li>
            <li>• Model responses (for the comparison)</li>
            <li>• Your votes (for the leaderboard)</li>
            <li>• IP address (for rate limiting only)</li>
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            We don't sell your data. Your prompts may be processed by OpenAI and 
            Anthropic according to their respective privacy policies.
          </p>
        </div>
      </section>

      {/* Open Source */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Open Source
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          BlindLane is open source. You can inspect the code, suggest improvements, 
          or run your own instance.
        </p>
        <a
          href="https://github.com/AppyAccidents/blindlane"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          View on GitHub
        </a>
      </section>
    </div>
  );
}
