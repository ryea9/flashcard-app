const setNameInput = document.getElementById('setName');
const setDescriptionInput = document.getElementById('setDescription');
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');
const addBtn = document.getElementById('addBtn');
const flashcardsContainer = document.getElementById('flashcards-container');
const emptyState = document.getElementById('emptyState');
const setupProgress = document.getElementById('setupProgress');
const feedbackMessage = document.getElementById('feedbackMessage');
const setupSection = document.getElementById('setupSection');
const studySection = document.getElementById('studySection');
const startStudyBtn = document.getElementById('startStudyBtn');
const topBackBtn = document.getElementById('topBackBtn');
const resultsBackBtn = document.getElementById('resultsBackBtn');
const restartStudyBtn = document.getElementById('restartStudyBtn');
const studySetTitle = document.getElementById('studySetTitle');
const studySetDescription = document.getElementById('studySetDescription');
const studyCardSection = document.getElementById('studyCardSection');
const studyCard = document.getElementById('studyCard');
const studyFrontText = document.getElementById('studyFrontText');
const studyBackText = document.getElementById('studyBackText');
const cardCounter = document.getElementById('cardCounter');
const progressFill = document.getElementById('progressFill');
const flipNote = document.getElementById('flipNote');
const correctCount = document.getElementById('correctCount');
const incorrectCount = document.getElementById('incorrectCount');
const remainingCount = document.getElementById('remainingCount');
const answerActions = document.getElementById('answerActions');
const rightBtn = document.getElementById('rightBtn');
const wrongBtn = document.getElementById('wrongBtn');
const studyCompletePanel = document.getElementById('studyCompletePanel');
const studyCompleteActions = document.getElementById('studyCompleteActions');
const studySummaryText = document.getElementById('studySummaryText');
const summaryTotal = document.getElementById('summaryTotal');
const summaryCorrect = document.getElementById('summaryCorrect');
const summaryIncorrect = document.getElementById('summaryIncorrect');
const summaryScore = document.getElementById('summaryScore');

const editModal = document.getElementById('editModal');
const editQuestionInput = document.getElementById('editQuestion');
const editAnswerInput = document.getElementById('editAnswer');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let studyCards = [];
let studyQueue = [];
let currentCardIndex = 0;
let editingCardId = null;
let deletingCardId = null;
let saveSetTimeout = null;
let sessionTotal = 0;
let sessionCorrect = 0;
let sessionIncorrect = 0;
let isShowingAnswer = false;

function showFeedback(message, type = 'success') {
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback-message ${type}`;

  if (!message) return;

  setTimeout(() => {
    if (feedbackMessage.textContent === message) {
      feedbackMessage.textContent = '';
      feedbackMessage.className = 'feedback-message';
    }
  }, 2500);
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function updateSetupState() {
  const count = studyCards.length;
  setupProgress.textContent = count === 1 ? '1 card' : `${count} cards`;
  emptyState.style.display = count === 0 ? 'block' : 'none';
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

async function loadSetInfo() {
  const response = await fetch('/api/set');
  const data = await handleResponse(response);
  setNameInput.value = data.title || '';
  setDescriptionInput.value = data.description || '';
  updateStudyHeader();
}

function updateStudyHeader() {
  const title = setNameInput.value.trim();
  const description = setDescriptionInput.value.trim();
  studySetTitle.textContent = title || 'Study Flashcards';
  studySetDescription.textContent =
    description || 'Flip each card and mark whether you got it right.';
}

async function saveSetInfoSilently() {
  const title = setNameInput.value.trim();
  const description = setDescriptionInput.value.trim();

  try {
    await fetch('/api/set', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
  } catch (error) {
    console.error('Failed to auto-save set details');
  }
}

function queueSetSave() {
  updateStudyHeader();
  clearTimeout(saveSetTimeout);
  saveSetTimeout = setTimeout(saveSetInfoSilently, 500);
}

function createFlashcardElement(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'flashcard';

  cardDiv.innerHTML = `
    <div class="flashcard-text">
      <h3>${escapeHtml(card.question)}</h3>
      <p class="flashcard-answer hidden-answer">${escapeHtml(card.answer)}</p>
      <div class="flashcard-toggle-note">Click the card to show or hide the definition</div>
    </div>
    <div class="flashcard-actions">
      <button type="button" class="flashcard-action-btn delete-btn" data-action="delete" data-id="${card.id}">
        Delete
      </button>
      <button type="button" class="flashcard-action-btn edit-btn" data-action="edit" data-id="${card.id}">
        Edit
      </button>
    </div>
  `;

  cardDiv.addEventListener('click', (event) => {
    const button = event.target.closest('button');

    if (button) {
      const action = button.dataset.action;
      const id = Number(button.dataset.id);

      if (action === 'delete') openDeleteModal(id);
      if (action === 'edit') editFlashcard(id, card.question, card.answer);
      return;
    }

    const answer = cardDiv.querySelector('.flashcard-answer');
    answer.classList.toggle('hidden-answer');
  });

  return cardDiv;
}

async function loadFlashcards() {
  try {
    const response = await fetch('/api/flashcards');
    const cards = await handleResponse(response);

    studyCards = cards;
    flashcardsContainer.innerHTML = '';

    cards.forEach((card) => {
      flashcardsContainer.appendChild(createFlashcardElement(card));
    });

    updateSetupState();
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

async function addFlashcard() {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!question || !answer) {
    showFeedback('Please enter both a term and a definition', 'error');
    return;
  }

  try {
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    });

    const data = await handleResponse(response);

    questionInput.value = '';
    answerInput.value = '';

    await loadFlashcards();
    showFeedback(data.message);
    questionInput.focus();
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

function openDeleteModal(id) {
  deletingCardId = id;
  deleteModal.classList.remove('hidden-section');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden-section');
  deletingCardId = null;
}

async function deleteFlashcard() {
  if (deletingCardId === null) return;

  confirmDeleteBtn.disabled = true;

  try {
    const response = await fetch(`/api/flashcards/${deletingCardId}`, {
      method: 'DELETE'
    });

    const data = await handleResponse(response);

    closeDeleteModal();
    await loadFlashcards();
    showFeedback(data.message);
  } catch (error) {
    showFeedback(error.message, 'error');
  } finally {
    confirmDeleteBtn.disabled = false;
  }
}

function editFlashcard(id, oldQuestion, oldAnswer) {
  editingCardId = id;
  editQuestionInput.value = oldQuestion;
  editAnswerInput.value = oldAnswer;
  editModal.classList.remove('hidden-section');
  editQuestionInput.focus();
}

function closeEditModal() {
  editModal.classList.add('hidden-section');
  editingCardId = null;
  editQuestionInput.value = '';
  editAnswerInput.value = '';
}

async function saveEditedFlashcard() {
  const question = editQuestionInput.value.trim();
  const answer = editAnswerInput.value.trim();

  if (!question || !answer) {
    showFeedback('Both fields must have a value', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/flashcards/${editingCardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    });

    const data = await handleResponse(response);

    closeEditModal();
    await loadFlashcards();
    showFeedback(data.message);
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

function resetStudySession() {
  studyQueue = [...studyCards];
  currentCardIndex = 0;
  sessionTotal = studyQueue.length;
  sessionCorrect = 0;
  sessionIncorrect = 0;
  isShowingAnswer = false;

  studyCard.classList.remove('flipped');
  studyCard.classList.remove('no-animate');

  studyCompletePanel.classList.add('hidden-section');
  studyCompleteActions.classList.add('hidden-section');
  studyCardSection.classList.remove('hidden-section');
  flipNote.classList.remove('hidden-section');
  studySetDescription.classList.remove('hidden-section');
  answerActions.classList.remove('hidden-section');
  topBackBtn.classList.remove('hidden-section');
}

function updateStudyStats() {
  correctCount.textContent = sessionCorrect;
  incorrectCount.textContent = sessionIncorrect;
  remainingCount.textContent = studyQueue.length;

  if (sessionTotal === 0) {
    progressFill.style.width = '0%';
    cardCounter.textContent = '0 / 0';
    return;
  }

  const completed = sessionCorrect + sessionIncorrect;
  const progressPercent = (completed / sessionTotal) * 100;

  progressFill.style.width = `${progressPercent}%`;
  cardCounter.textContent = `${completed} / ${sessionTotal}`;
}

function renderStudyCard() {
  updateStudyStats();

  if (studyQueue.length === 0) {
    finishStudySession();
    return;
  }

  if (currentCardIndex >= studyQueue.length) {
    currentCardIndex = 0;
  }

  const card = studyQueue[currentCardIndex];
  studyFrontText.textContent = card.question;
  studyBackText.textContent = card.answer;

  if (isShowingAnswer) {
    studyCard.classList.add('flipped');
  } else {
    studyCard.classList.remove('flipped');
  }
}

function flipStudyCard() {
  if (studyQueue.length === 0) return;
  if (!studyCompletePanel.classList.contains('hidden-section')) return;

  isShowingAnswer = !isShowingAnswer;
  renderStudyCard();
}

function prepareNextCardWithoutFlash() {
  studyCard.classList.add('no-animate');
  studyCard.classList.remove('flipped');
  isShowingAnswer = false;
}

function restoreCardAnimation() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      studyCard.classList.remove('no-animate');
    });
  });
}

function finishStudySession() {
  studyCardSection.classList.add('hidden-section');
  answerActions.classList.add('hidden-section');
  studyCompletePanel.classList.remove('hidden-section');
  studyCompleteActions.classList.remove('hidden-section');
  flipNote.classList.add('hidden-section');
  studySetDescription.classList.add('hidden-section');
  topBackBtn.classList.add('hidden-section');

  const total = sessionTotal;
  const correct = sessionCorrect;
  const incorrect = sessionIncorrect;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  studySummaryText.textContent = `You completed all ${total} flashcards.`;
  summaryTotal.textContent = total;
  summaryCorrect.textContent = correct;
  summaryIncorrect.textContent = incorrect;
  summaryScore.textContent = `${score}%`;

  updateStudyStats();
}

function startStudying() {
  if (studyCards.length === 0) {
    showFeedback('Please add at least one flashcard first', 'error');
    return;
  }

  updateStudyHeader();
  resetStudySession();
  setupSection.classList.add('hidden-section');
  studySection.classList.remove('hidden-section');
  renderStudyCard();
}

function restartStudying() {
  if (studyCards.length === 0) {
    goBackToEdit();
    return;
  }

  resetStudySession();
  renderStudyCard();
}

function goBackToEdit() {
  studySection.classList.add('hidden-section');
  setupSection.classList.remove('hidden-section');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function markCardResult(isCorrect) {
  if (studyQueue.length === 0) return;

  if (isCorrect) {
    sessionCorrect += 1;
  } else {
    sessionIncorrect += 1;
  }

  prepareNextCardWithoutFlash();
  studyQueue.splice(currentCardIndex, 1);

  if (currentCardIndex >= studyQueue.length) {
    currentCardIndex = 0;
  }

  renderStudyCard();
  restoreCardAnimation();
}

function isTypingTarget(target) {
  if (!target) return false;

  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
}

function isStudyModeActive() {
  return !studySection.classList.contains('hidden-section');
}

addBtn.addEventListener('click', addFlashcard);
startStudyBtn.addEventListener('click', startStudying);
restartStudyBtn.addEventListener('click', restartStudying);
topBackBtn.addEventListener('click', goBackToEdit);
resultsBackBtn.addEventListener('click', goBackToEdit);

rightBtn.addEventListener('click', () => markCardResult(true));
wrongBtn.addEventListener('click', () => markCardResult(false));

studyCard.addEventListener('click', flipStudyCard);

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
saveEditBtn.addEventListener('click', saveEditedFlashcard);

closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', deleteFlashcard);

editModal.addEventListener('click', (event) => {
  if (event.target === editModal) closeEditModal();
});

deleteModal.addEventListener('click', (event) => {
  if (event.target === deleteModal) closeDeleteModal();
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') {
    if (!editModal.classList.contains('hidden-section')) closeEditModal();
    if (!deleteModal.classList.contains('hidden-section')) closeDeleteModal();
    return;
  }

  if (!isStudyModeActive()) return;
  if (isTypingTarget(event.target)) return;
  if (!editModal.classList.contains('hidden-section')) return;
  if (!deleteModal.classList.contains('hidden-section')) return;
  if (!studyCompletePanel.classList.contains('hidden-section')) return;

  if (event.code === 'Space') {
    event.preventDefault();
    flipStudyCard();
  }
});

setNameInput.addEventListener('input', queueSetSave);
setDescriptionInput.addEventListener('input', queueSetSave);

async function initialiseApp() {
  try {
    await loadSetInfo();
    await loadFlashcards();
    updateStudyHeader();
    updateStudyStats();
  } catch (error) {
    console.error('Failed to initialise app:', error);
    showFeedback('Failed to load the app. Please check that the server and database are running.', 'error');
  }
}

initialiseApp();