<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Practice — Ujyalo</title>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          display: ['Fraunces', 'serif'],
          sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        },
        colors: {
          ink: {
            50:  '#F6F8FB',
            100: '#EDF1F7',
            200: '#D9E1EC',
            300: '#B5C0D0',
            500: '#5C6B82',
            700: '#1F2D44',
            900: '#0A1628',
          },
          brand: {
            50:  '#EBF1F9',
            100: '#D2E0F1',
            300: '#7BA3D6',
            500: '#1E5FA8',
            600: '#174D8B',
            700: '#103A6E',
            900: '#0A2547',
          },
          sun: {
            50:  '#FEF7E6',
            100: '#FDECC2',
            300: '#F8C56B',
            500: '#F59E0B',
            600: '#D88708',
          },
        },
        animation: {
          'fade-up':  'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
          'fade-in':  'fadeIn 0.5s ease both',
          'sun-spin': 'spin 24s linear infinite',
          'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        },
        keyframes: {
          fadeUp:    { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
          fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
          pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        },
      },
    },
  };
</script>

<style>
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  .font-display { font-family: 'Fraunces', serif; }

  .mesh-bg {
    background:
      radial-gradient(at 0% 0%, #FEF7E6 0px, transparent 50%),
      radial-gradient(at 100% 100%, #EBF1F9 0px, transparent 50%),
      #FCFCFC;
  }

  /* Subject button */
  .subject-btn {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .subject-btn:hover:not(.selected) {
    transform: translateY(-2px);
    border-color: #B5C0D0;
  }
  .subject-btn.selected {
    background: #0A1628;
    color: white;
    border-color: #0A1628;
  }

  /* Loading dots */
  .dot-loader { display: inline-flex; gap: 4px; }
  .dot-loader span {
    width: 6px; height: 6px;
    background: #5C6B82;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
  }
  .dot-loader span:nth-child(1) { animation-delay: -0.32s; }
  .dot-loader span:nth-child(2) { animation-delay: -0.16s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* Smooth show */
  .show-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes fadeUp {
    0%   { opacity: 0; transform: translateY(16px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* Custom textarea */
  .answer-input {
    transition: all 0.2s ease;
    resize: vertical;
  }
  .answer-input:focus {
    outline: none;
    border-color: #1E5FA8;
    box-shadow: 0 0 0 3px rgba(30, 95, 168, 0.1);
  }

  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-track { background: #F6F8FB; }
  ::-webkit-scrollbar-thumb { background: #B5C0D0; border-radius: 5px; }
</style>
</head>
<body class="bg-white text-ink-900 antialiased min-h-screen flex flex-col">

<!-- ═══════════════════════════════════════════════════════════
     NAVIGATION
═══════════════════════════════════════════════════════════ -->
<nav class="border-b border-ink-100 bg-white sticky top-0 z-50">
  <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 group">
      <svg class="group-hover:animate-sun-spin" width="26" height="26" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="6" fill="#F59E0B" />
        <g stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round">
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="16" y1="26" x2="16" y2="30" />
          <line x1="2" y1="16" x2="6" y2="16" />
          <line x1="26" y1="16" x2="30" y2="16" />
          <line x1="6" y1="6" x2="9" y2="9" />
          <line x1="23" y1="23" x2="26" y2="26" />
          <line x1="26" y1="6" x2="23" y2="9" />
          <line x1="9" y1="23" x2="6" y2="26" />
        </g>
      </svg>
      <span class="font-display font-bold text-2xl tracking-tight text-brand-500">ujyalo</span>
    </a>

    <a href="/" class="text-sm font-medium text-ink-500 hover:text-ink-900 transition flex items-center gap-1.5">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M11 7H3m4-3l-4 3 4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Home
    </a>
  </div>
</nav>

<!-- ═══════════════════════════════════════════════════════════
     PRACTICE HEADER
═══════════════════════════════════════════════════════════ -->
<section class="mesh-bg pt-16 pb-12">
  <div class="max-w-3xl mx-auto px-6 text-center">
    <div class="inline-flex items-center gap-2 bg-white border border-ink-200 rounded-full px-4 py-1.5 text-xs font-medium text-ink-700 mb-6 animate-fade-up">
      <span class="w-1.5 h-1.5 rounded-full bg-sun-500 animate-pulse-soft"></span>
      Live AI tutor
    </div>

    <h1 class="font-display font-bold text-5xl md:text-6xl tracking-tight leading-[1.05] mb-4 animate-fade-up" style="animation-delay: 0.1s;">
      Let's <span class="italic font-medium">practise.</span>
    </h1>
    <p class="text-lg text-ink-500 max-w-md mx-auto animate-fade-up" style="animation-delay: 0.2s;">
      Pick a subject. AI will create a fresh question just for you.
    </p>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════
     PRACTICE CARD
═══════════════════════════════════════════════════════════ -->
<main class="flex-1 py-12 bg-white">
  <div class="max-w-2xl mx-auto px-6">

    <!-- Subject selection -->
    <div class="mb-10 animate-fade-up" style="animation-delay: 0.3s;">
      <div class="text-xs uppercase tracking-widest text-ink-500 font-semibold mb-4">Choose your subject</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button class="subject-btn bg-white border-2 border-ink-100 rounded-2xl p-4 text-left flex items-center gap-3" onclick="selectSubject(this, 'Compulsory Maths')">
          <span class="text-xl">🧮</span>
          <span class="font-medium text-sm">Maths</span>
        </button>
        <button class="subject-btn bg-white border-2 border-ink-100 rounded-2xl p-4 text-left flex items-center gap-3" onclick="selectSubject(this, 'Science')">
          <span class="text-xl">🔬</span>
          <span class="font-medium text-sm">Science</span>
        </button>
        <button class="subject-btn bg-white border-2 border-ink-100 rounded-2xl p-4 text-left flex items-center gap-3" onclick="selectSubject(this, 'Compulsory English')">
          <span class="text-xl">📖</span>
          <span class="font-medium text-sm">English</span>
        </button>
        <button class="subject-btn bg-white border-2 border-ink-100 rounded-2xl p-4 text-left flex items-center gap-3" onclick="selectSubject(this, 'Social Studies')">
          <span class="text-xl">🌏</span>
          <span class="font-medium text-sm">Social</span>
        </button>
        <button class="subject-btn bg-white border-2 border-ink-100 rounded-2xl p-4 text-left flex items-center gap-3" onclick="selectSubject(this, 'Compulsory Nepali')">
          <span class="text-xl">📝</span>
          <span class="font-medium text-sm">Nepali</span>
        </button>
      </div>
    </div>

    <!-- Generate button -->
    <button id="generateBtn" onclick="generateQuestion()" disabled
      class="w-full bg-ink-900 text-white py-4 rounded-2xl text-base font-semibold transition-all duration-300 disabled:bg-ink-200 disabled:text-ink-500 disabled:cursor-not-allowed hover:bg-brand-500 enabled:hover:-translate-y-0.5 enabled:shadow-xl enabled:shadow-ink-900/10 flex items-center justify-center gap-2">
      <span>Pick a subject first</span>
    </button>

    <!-- Loading -->
    <div id="loading" class="hidden text-center py-10">
      <div class="dot-loader inline-flex">
        <span></span><span></span><span></span>
      </div>
      <div class="text-sm text-ink-500 mt-3">Thinking...</div>
    </div>

    <!-- Question Box -->
    <div id="questionBox" class="hidden show-up bg-ink-50 border border-ink-100 rounded-3xl p-8 mt-8">
      <div class="text-xs uppercase tracking-widest text-brand-500 font-semibold mb-3">Question</div>
      <div id="questionText" class="font-display text-xl leading-relaxed text-ink-900 mb-6"></div>

      <textarea id="answerInput" placeholder="Type your answer here..."
        class="answer-input w-full bg-white border border-ink-200 rounded-2xl p-4 text-base placeholder:text-ink-300 min-h-[120px]"></textarea>

      <button onclick="submitAnswer()"
        class="w-full bg-brand-500 hover:bg-brand-600 text-white py-4 rounded-2xl text-base font-semibold mt-3 transition hover:-translate-y-0.5">
        Check my answer
      </button>
    </div>

    <!-- Feedback Box -->
    <div id="feedbackBox" class="hidden show-up rounded-3xl p-8 mt-6 border-2">
      <div class="flex items-center gap-2 mb-3">
        <span id="verdictIcon" class="text-2xl"></span>
        <div id="verdict" class="font-display text-xl font-semibold"></div>
      </div>
      <div id="feedbackText" class="text-base leading-relaxed text-ink-700"></div>

      <button onclick="generateQuestion()"
        class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-brand-500 transition">
        Try another question
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8m-3-3l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

  </div>
</main>

<!-- Footer -->
<footer class="py-8 border-t border-ink-100 bg-white">
  <div class="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-ink-500">
    <div>© 2026 Ujyalo. Made in Nepal 🇳🇵</div>
    <div class="font-display italic">Brighten your future.</div>
  </div>
</footer>

<script>
let currentSubject = '';
let currentQuestion = '';

function selectSubject(btn, subject) {
  document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  currentSubject = subject;
  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = false;
  generateBtn.innerHTML = '<span>Generate question</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m-4-4l4 4-4 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

async function generateQuestion() {
  const loading = document.getElementById('loading');
  const questionBox = document.getElementById('questionBox');
  const feedbackBox = document.getElementById('feedbackBox');

  loading.classList.remove('hidden');
  questionBox.classList.add('hidden');
  feedbackBox.classList.add('hidden');

  try {
    const res = await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', subject: currentSubject })
    });
    const data = await res.json();

    if (data.error) {
      alert('Error: ' + data.error);
      loading.classList.add('hidden');
      return;
    }

    currentQuestion = data.question;
    document.getElementById('questionText').textContent = data.question;
    document.getElementById('answerInput').value = '';
    questionBox.classList.remove('hidden');
    loading.classList.add('hidden');

    // Smooth scroll to question
    setTimeout(() => questionBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  } catch (e) {
    alert('Something went wrong. Please try again.');
    loading.classList.add('hidden');
  }
}

async function submitAnswer() {
  const answer = document.getElementById('answerInput').value.trim();
  if (!answer) {
    alert('Please type your answer first');
    return;
  }

  const loading = document.getElementById('loading');
  const feedbackBox = document.getElementById('feedbackBox');

  loading.classList.remove('hidden');
  feedbackBox.classList.add('hidden');

  try {
    const res = await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate',
        subject: currentSubject,
        question: currentQuestion,
        studentAnswer: answer
      })
    });
    const data = await res.json();

    if (data.error) {
      alert('Error: ' + data.error);
      loading.classList.add('hidden');
      return;
    }

    const verdict = document.getElementById('verdict');
    const verdictIcon = document.getElementById('verdictIcon');
    const feedbackText = document.getElementById('feedbackText');

    // Reset classes
    feedbackBox.className = 'show-up rounded-3xl p-8 mt-6 border-2';

    if (data.verdict === 'correct') {
      feedbackBox.classList.add('bg-green-50', 'border-green-200');
      verdict.classList.add('text-green-700');
      verdict.textContent = 'Correct';
      verdictIcon.textContent = '✓';
      verdictIcon.className = 'text-2xl text-green-600';
    } else if (data.verdict === 'partial') {
      feedbackBox.classList.add('bg-sun-50', 'border-sun-100');
      verdict.classList.add('text-sun-600');
      verdict.textContent = 'Partially correct';
      verdictIcon.textContent = '~';
      verdictIcon.className = 'text-2xl text-sun-500';
    } else {
      feedbackBox.classList.add('bg-red-50', 'border-red-200');
      verdict.classList.add('text-red-700');
      verdict.textContent = 'Not quite right';
      verdictIcon.textContent = '✗';
      verdictIcon.className = 'text-2xl text-red-600';
    }

    feedbackText.textContent = data.feedback;
    feedbackBox.classList.remove('hidden');
    loading.classList.add('hidden');

    setTimeout(() => feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  } catch (e) {
    alert('Something went wrong. Please try again.');
    loading.classList.add('hidden');
  }
}
</script>

</body>
</html>
