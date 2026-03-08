// ============================================
// BLINDLANE VITE DEMO - Interactive Logic
// ============================================

// Mock responses for demo
const MOCK_RESPONSES = {
  a: `Quantum computing is a revolutionary approach to computation that leverages the principles of quantum mechanics. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously through superposition.

Key concepts:
• Superposition: Qubits can be 0, 1, or both at once
• Entanglement: Qubits can be linked in mysterious ways
• Interference: Used to amplify correct answers

Think of it like this: while a classical computer solves a maze by trying each path one by one, a quantum computer can explore all paths simultaneously, making it incredibly powerful for certain problems like cryptography and drug discovery.`,

  b: `Imagine if your computer could try every possible solution to a problem at the same time, instead of one by one. That's essentially what quantum computing does!

At its core, quantum computing uses "qubits" - tiny particles that can be in multiple states simultaneously thanks to a quantum property called superposition. It's like a coin spinning in the air: while it's spinning, it's neither heads nor tails, but potentially both.

This allows quantum computers to:
→ Process vast amounts of data simultaneously
→ Solve complex optimization problems faster
→ Break modern encryption (and create new secure methods)
→ Simulate molecular interactions for drug development

While still in early stages, quantum computers promise to revolutionize fields from medicine to artificial intelligence.`
};

// DOM Elements
const elements = {
  form: document.getElementById('compare-form'),
  input: document.getElementById('prompt-input'),
  counter: document.querySelector('.input-counter'),
  error: document.getElementById('error-message'),
  emptyState: document.getElementById('empty-state'),
  resultsContainer: document.getElementById('results-container'),
  responseA: document.getElementById('response-a'),
  responseB: document.getElementById('response-b'),
  cursorA: document.getElementById('cursor-a'),
  cursorB: document.getElementById('cursor-b'),
  revealA: document.getElementById('reveal-a'),
  revealB: document.getElementById('reveal-b'),
  costCard: document.getElementById('cost-card'),
  votingSection: document.getElementById('voting-section'),
  voteSuccess: document.getElementById('vote-success'),
  voteA: document.getElementById('vote-a'),
  voteB: document.getElementById('vote-b'),
  voteTie: document.getElementById('vote-tie'),
  resetBtn: document.getElementById('reset-btn'),
  modelACard: document.getElementById('model-a-card'),
  modelBCard: document.getElementById('model-b-card'),
};

let isStreaming = false;
let hasVoted = false;

// ============================================
// Event Listeners
// ============================================

// Character counter
elements.input.addEventListener('input', () => {
  const length = elements.input.value.length;
  elements.counter.textContent = `${length}/1000`;
  
  if (length > 900) {
    elements.counter.style.color = 'var(--accent-orange)';
  } else {
    elements.counter.style.color = 'var(--text-muted)';
  }
});

// Form submission
elements.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const prompt = elements.input.value.trim();
  
  if (!prompt) {
    showError('Please enter a prompt');
    return;
  }
  
  if (prompt.length < 3) {
    showError('Prompt is too short (min 3 characters)');
    return;
  }
  
  hideError();
  startComparison();
});

// Voting buttons
elements.voteA.addEventListener('click', () => handleVote('A'));
elements.voteB.addEventListener('click', () => handleVote('B'));
elements.voteTie.addEventListener('click', () => handleVote('Tie'));

// Reset button
elements.resetBtn.addEventListener('click', resetComparison);

// ============================================
// Functions
// ============================================

function showError(message) {
  elements.error.textContent = message;
  elements.error.style.display = 'block';
}

function hideError() {
  elements.error.style.display = 'none';
}

async function startComparison() {
  // Show loading state
  const submitBtn = elements.form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `
    <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <span>Processing...</span>
  `;
  submitBtn.disabled = true;
  
  // Simulate API delay
  await delay(1500);
  
  // Switch to results view
  elements.emptyState.style.display = 'none';
  elements.resultsContainer.style.display = 'block';
  
  // Reset button
  submitBtn.innerHTML = originalText;
  submitBtn.disabled = false;
  
  // Start streaming
  isStreaming = true;
  elements.cursorA.style.display = 'inline-block';
  elements.cursorB.style.display = 'inline-block';
  
  await streamResponses();
  
  isStreaming = false;
  elements.cursorA.style.display = 'none';
  elements.cursorB.style.display = 'none';
}

async function streamResponses() {
  const responseA = MOCK_RESPONSES.a;
  const responseB = MOCK_RESPONSES.b;
  
  const maxLength = Math.max(responseA.length, responseB.length);
  const charsPerFrame = 3;
  const delayMs = 15;
  
  for (let i = 0; i < maxLength; i += charsPerFrame) {
    const currentA = responseA.slice(0, Math.min(i + charsPerFrame, responseA.length));
    const currentB = responseB.slice(0, Math.min(i + charsPerFrame, responseB.length));
    
    elements.responseA.textContent = currentA;
    elements.responseB.textContent = currentB;
    
    // Auto-scroll to bottom
    elements.responseA.parentElement.scrollTop = elements.responseA.parentElement.scrollHeight;
    elements.responseB.parentElement.scrollTop = elements.responseB.parentElement.scrollHeight;
    
    await delay(delayMs);
  }
  
  // Ensure full text is shown
  elements.responseA.textContent = responseA;
  elements.responseB.textContent = responseB;
}

async function handleVote(vote) {
  if (hasVoted || isStreaming) return;
  
  hasVoted = true;
  
  // Show loading on button
  const btn = vote === 'A' ? elements.voteA : vote === 'B' ? elements.voteB : elements.voteTie;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>`;
  btn.disabled = true;
  
  // Simulate API call
  await delay(800);
  
  // Hide voting section, show success
  elements.votingSection.style.display = 'none';
  elements.voteSuccess.style.display = 'block';
  elements.costCard.style.display = 'flex';
  
  // Reveal model identities
  elements.revealA.style.display = 'flex';
  elements.revealB.style.display = 'flex';
  
  // Update success message
  const successText = elements.voteSuccess.querySelector('.success-text');
  if (vote === 'Tie') {
    successText.textContent = 'You rated both models equally.';
  } else {
    successText.textContent = `You selected Model ${vote} as superior.`;
  }
  
  // Highlight winner card
  if (vote === 'A') {
    elements.modelACard.style.borderColor = 'rgba(34, 197, 94, 0.5)';
    elements.modelACard.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.2)';
  } else if (vote === 'B') {
    elements.modelBCard.style.borderColor = 'rgba(34, 197, 94, 0.5)';
    elements.modelBCard.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.2)';
  }
}

function resetComparison() {
  // Reset state
  hasVoted = false;
  isStreaming = false;
  
  // Clear input
  elements.input.value = '';
  elements.counter.textContent = '0/1000';
  
  // Hide results
  elements.resultsContainer.style.display = 'none';
  elements.emptyState.style.display = 'flex';
  elements.costCard.style.display = 'none';
  elements.voteSuccess.style.display = 'none';
  elements.votingSection.style.display = 'block';
  
  // Hide reveals
  elements.revealA.style.display = 'none';
  elements.revealB.style.display = 'none';
  
  // Reset responses
  elements.responseA.textContent = 'Waiting for response...';
  elements.responseB.textContent = 'Waiting for response...';
  elements.responseA.classList.add('text-muted');
  elements.responseB.classList.add('text-muted');
  
  // Reset card styles
  elements.modelACard.style.borderColor = '';
  elements.modelACard.style.boxShadow = '';
  elements.modelBCard.style.borderColor = '';
  elements.modelBCard.style.boxShadow = '';
  
  // Reset buttons
  elements.voteA.innerHTML = '<span>Vote A</span>';
  elements.voteA.disabled = false;
  elements.voteB.innerHTML = '<span>Vote B</span>';
  elements.voteB.disabled = false;
  elements.voteTie.disabled = false;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Smooth Scroll for Navigation
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// Add spin animation for loading
// ============================================

const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ============================================
// Console welcome message
// ============================================

console.log(
  '%c BlindLane Demo ',
  'background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;'
);
console.log('%cAI Model Comparison Platform', 'color: #a1a1aa; font-size: 14px;');
console.log('%cEnter a prompt and click "Compare Models" to see the demo in action!', 'color: #f97316; font-size: 12px;');
