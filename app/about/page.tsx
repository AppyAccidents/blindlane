// ============================================
// About Page - Terminal Theme
// ============================================

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs text-cyan-400 font-mono">
          <span>?</span>
          <span>ABOUT_SYSTEM</span>
        </div>
        <h1 className="text-3xl font-bold text-cyan-400 font-mono">
          &gt; About BlindLane
        </h1>
        <p className="text-cyan-700 font-mono text-sm">
          Fair AI model comparison through blind testing
        </p>
      </div>

      {/* What is BlindLane? */}
      <section className="terminal-panel">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-cyan-500">◈</span>
          <h2 className="text-cyan-400 font-mono font-semibold">What is BlindLane?</h2>
        </div>
        
        <div className="space-y-4 text-cyan-300 text-sm leading-relaxed">
          <p>
            BlindLane is a blind comparison tool for AI language models. Like the famous 
            Pepsi Challenge, we hide which model is which so you can judge responses 
            purely on quality—without brand bias.
          </p>
          <p>
            You enter a prompt, two AI models respond anonymously, and you vote for the 
            better one. Only after voting do we reveal which model was which.
          </p>
        </div>
      </section>

      {/* Why Blind Testing? */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="terminal-panel">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl text-cyan-500">◉</span>
            <h3 className="text-cyan-400 font-mono font-semibold">Remove Bias</h3>
          </div>
          <p className="text-sm text-cyan-700">
            People have strong opinions about AI brands. Blind testing ensures 
            you're judging the response, not the logo.
          </p>
        </div>
        
        <div className="terminal-panel">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl text-orange-500">◊</span>
            <h3 className="text-orange-400 font-mono font-semibold">Find the Best</h3>
          </div>
          <p className="text-sm text-cyan-700">
            Different models excel at different tasks. Blind testing helps you 
            discover which works best for your needs.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="terminal-panel">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-cyan-500">⚙</span>
          <h2 className="text-cyan-400 font-mono font-semibold">How It Works</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { step: '01', title: 'Enter Prompt', desc: 'Ask anything—creative writing, coding help, analysis, or casual chat.' },
            { step: '02', title: 'Random Assignment', desc: 'Models randomly assigned to A or B. Identity encrypted until vote.' },
            { step: '03', title: 'Compare Outputs', desc: 'Review both responses side-by-side. Evaluate quality objectively.' },
            { step: '04', title: 'Vote & Reveal', desc: 'Cast your vote, then decrypt to see which model you chose.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center">
                <span className="text-cyan-400 font-mono text-sm font-bold">{item.step}</span>
              </div>
              <div>
                <h3 className="text-cyan-300 font-mono font-semibold text-sm">{item.title}</h3>
                <p className="text-cyan-700 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Current Models */}
      <section className="terminal-panel">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-cyan-500">◇</span>
          <h2 className="text-cyan-400 font-mono font-semibold">Active Models</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded border border-cyan-500/20 bg-cyan-500/5">
            <h3 className="text-cyan-400 font-mono font-semibold mb-1">GPT-4o Mini</h3>
            <p className="text-xs text-cyan-700 font-mono mb-3">by OpenAI</p>
            <p className="text-sm text-cyan-300">
              Fast, affordable model optimized for everyday tasks. Good balance 
              of speed and quality.
            </p>
          </div>
          
          <div className="p-4 rounded border border-orange-500/20 bg-orange-500/5">
            <h3 className="text-orange-400 font-mono font-semibold mb-1">Claude 3.5 Haiku</h3>
            <p className="text-xs text-orange-700 font-mono mb-3">by Anthropic</p>
            <p className="text-sm text-cyan-300">
              Anthropic's fastest model, known for nuanced responses and strong 
              reasoning abilities.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="terminal-panel">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-500">$</span>
          <h2 className="text-cyan-400 font-mono font-semibold">Pricing Transparency</h2>
        </div>
        
        <p className="text-sm text-cyan-700 mb-4">
          We show you exactly how much each comparison costs. No hidden fees, no markup.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="pb-3 text-left text-cyan-400">Model</th>
                <th className="pb-3 text-right text-cyan-400">Input (per 1M)</th>
                <th className="pb-3 text-right text-cyan-400">Output (per 1M)</th>
              </tr>
            </thead>
            <tbody className="text-cyan-300">
              <tr>
                <td className="py-3">GPT-4o Mini</td>
                <td className="py-3 text-right text-cyan-500">$0.15</td>
                <td className="py-3 text-right text-cyan-500">$0.60</td>
              </tr>
              <tr>
                <td className="py-3">Claude 3.5 Haiku</td>
                <td className="py-3 text-right text-cyan-500">$0.25</td>
                <td className="py-3 text-right text-cyan-500">$1.25</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Open Source */}
      <section className="terminal-panel border-cyan-500/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-cyan-500">⚡</span>
          <h2 className="text-cyan-400 font-mono font-semibold">Open Source</h2>
        </div>
        
        <p className="text-sm text-cyan-300 mb-4">
          BlindLane is open source. Inspect the code, suggest improvements, or run your own instance.
        </p>
        
        <a
          href="https://github.com/AppyAccidents/blindlane"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cyber inline-flex"
        >
          <span>View on GitHub</span>
          <span className="ml-2">→</span>
        </a>
      </section>
    </div>
  );
}
