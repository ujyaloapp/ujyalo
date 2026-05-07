// ═══════════════════════════════════════════════════════════
// UJYALO — PRACTICE PAGE LOGIC
// ═══════════════════════════════════════════════════════════

let currentSubject = '';
let currentQuestion = '';

function selectSubject(btn, subject) {
  document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  currentSubject = subject;
  const generateBtn = document.getElementById('generateBtn');
  generateBtn.disabled = false;
  generateBtn.innerHTML = 'Generate question <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-left: 4px;"><path d="M3 7h8m-3-3l3 3-3 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
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

    if (data.verdict === 'correct') {
      feedbackBox.style.background = '#F0FDF4';
      feedbackBox.style.borderColor = '#BBF7D0';
      verdict.style.color = '#15803D';
      verdict.textContent = 'Correct!';
      verdictIcon.textContent = '✓';
      verdictIcon.style.color = '#15803D';
    } else if (data.verdict === 'partial') {
      feedbackBox.style.background = '#FEFCE8';
      feedbackBox.style.borderColor = '#FEF08A';
      verdict.style.color = '#A16207';
      verdict.textContent = 'Partially correct';
      verdictIcon.textContent = '~';
      verdictIcon.style.color = '#F59E0B';
    } else {
      feedbackBox.style.background = '#FEF2F2';
      feedbackBox.style.borderColor = '#FECACA';
      verdict.style.color = '#B91C1C';
      verdict.textContent = 'Not quite right';
      verdictIcon.textContent = '✗';
      verdictIcon.style.color = '#B91C1C';
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
