import { DialogueGame, ENDINGS, PROLOGUE } from './game-core.js';

const game = new DialogueGame();
const $ = (selector) => document.querySelector(selector);
const elements = {
  start: $('#startOverlay'), prologue: $('#prologueOverlay'), pause: $('#pauseOverlay'), ending: $('#endingOverlay'),
  startButton: $('#startButton'), pauseButton: $('#pauseButton'), resumeButton: $('#resumeButton'),
  prologueButton: $('#prologueButton'), prologueArt: $('#prologueArt'), prologueSymbol: $('#prologueSymbol'),
  prologueDate: $('#prologueDate'), prologueTitle: $('#prologueTitle'), prologueText: $('#prologueText'),
  prologueFact: $('#prologueFact'), storyDots: $('#storyDots'),
  restartButton: $('#restartButton'), endingRestartButton: $('#endingRestartButton'), choices: $('#choices'),
  speaker: $('#speakerName'), role: $('#playerRole'), text: $('#dialogueText'), scene: $('#sceneNumber'),
  trustMeter: $('#trustMeter'), trustValue: $('#trustValue'), signalMeter: $('#signalMeter'),
  signalValue: $('#signalValue'), timeValue: $('#timeValue'), progress: $('#progressBar'),
  lada: $('#ladaCard'), sever: $('#severCard'), endingTitle: $('#endingTitle'), endingText: $('#endingText'),
  endingSymbol: $('#endingSymbol'), endingKicker: $('#endingKicker'), routeSummary: $('#routeSummary')
};

function softTone(frequency = 420) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = softTone.context ||= new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + 0.18);
  } catch { /* Audio is optional. */ }
}

function setOverlay(element, active) {
  element.classList.toggle('active', active);
  element.setAttribute('aria-hidden', String(!active));
}

function choose(index) {
  if (!game.choose(index)) return;
  softTone(360 + index * 90);
  render();
}

function render() {
  const state = game.snapshot();
  const node = state.node;
  elements.scene.textContent = node.scene;
  elements.speaker.textContent = node.speaker;
  elements.role.textContent = node.role;
  elements.text.textContent = node.text;
  elements.trustMeter.style.width = `${state.trust * 20}%`;
  elements.trustValue.textContent = `${state.trust}/5`;
  elements.signalMeter.style.width = `${state.signal * 20}%`;
  elements.signalValue.textContent = `${state.signal}/5`;
  elements.timeValue.textContent = `${state.time} мин`;
  elements.progress.style.width = `${state.progress}%`;
  elements.pauseButton.disabled = !['running', 'paused'].includes(state.status);
  elements.pauseButton.querySelector('[aria-hidden]').textContent = state.status === 'paused' ? '▶' : 'Ⅱ';
  elements.pauseButton.querySelector('.button-label').textContent = state.status === 'paused' ? 'Продолжить' : 'Пауза';

  elements.lada.classList.toggle('active', node.active === 'lada' || node.active === 'both');
  elements.sever.classList.toggle('active', node.active === 'sever' || node.active === 'both');
  elements.lada.classList.toggle('dimmed', node.active === 'sever');
  elements.sever.classList.toggle('dimmed', node.active === 'lada');

  elements.choices.replaceChildren(...node.choices.map((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'choice';
    button.disabled = state.status !== 'running';
    button.innerHTML = `<span class="choice-key">${index + 1}</span><span class="choice-copy"><strong></strong><small></small></span><span class="choice-arrow" aria-hidden="true">→</span>`;
    button.querySelector('strong').textContent = choice.text;
    button.querySelector('small').textContent = choice.note;
    button.addEventListener('click', () => choose(index));
    return button;
  }));

  setOverlay(elements.start, state.status === 'idle');
  setOverlay(elements.prologue, state.status === 'intro');
  setOverlay(elements.pause, state.status === 'paused');
  setOverlay(elements.ending, state.status === 'finished');
  if (state.status === 'finished') {
    document.body.dataset.ending = state.ending.tone;
    elements.endingTitle.textContent = state.ending.title;
    elements.endingText.textContent = state.ending.text;
    elements.endingSymbol.textContent = state.ending.symbol;
    elements.endingKicker.textContent = `Концовка ${Object.keys(ENDINGS).indexOf(state.endingId) + 1} из 4 открыта`;
    elements.routeSummary.innerHTML = `<span>Доверие <b>${state.trust}/5</b></span><span>Сигнал <b>${state.signal}/5</b></span><span>Решений <b>${state.history.length}</b></span>`;
    requestAnimationFrame(() => elements.endingRestartButton.focus());
  } else {
    delete document.body.dataset.ending;
  }

  if (state.status === 'intro') {
    const story = state.prologue;
    elements.prologueDate.textContent = story.date;
    elements.prologueTitle.textContent = story.title;
    elements.prologueText.textContent = story.text;
    elements.prologueFact.textContent = story.fact;
    elements.prologueSymbol.textContent = story.symbol;
    elements.prologueArt.className = `prologue-art ${story.art}`;
    elements.prologueButton.firstChild.textContent = state.prologueIndex === PROLOGUE.length - 1 ? 'Выйти на связь ' : 'Дальше ';
    elements.storyDots.replaceChildren(...PROLOGUE.map((_, index) => {
      const dot = document.createElement('i');
      dot.classList.toggle('active', index === state.prologueIndex);
      dot.setAttribute('aria-label', `Кадр ${index + 1} из ${PROLOGUE.length}`);
      return dot;
    }));
  }
}

function start() {
  if (game.start()) { softTone(520); render(); requestAnimationFrame(() => elements.prologueButton.focus()); }
}

function advancePrologue() {
  if (!game.advanceIntro()) return;
  softTone(game.status === 'running' ? 560 : 430);
  render();
  requestAnimationFrame(() => (game.status === 'running' ? elements.choices.querySelector('button') : elements.prologueButton)?.focus());
}

function togglePause() {
  if (game.status === 'running') game.pause(); else if (game.status === 'paused') game.resume(); else return;
  softTone(game.status === 'paused' ? 260 : 520); render();
  requestAnimationFrame(() => (game.status === 'paused' ? elements.resumeButton : elements.choices.querySelector('button'))?.focus());
}

function restart() {
  game.reset(); render(); requestAnimationFrame(() => elements.startButton.focus());
}

elements.startButton.addEventListener('click', start);
elements.prologueButton.addEventListener('click', advancePrologue);
elements.pauseButton.addEventListener('click', togglePause);
elements.resumeButton.addEventListener('click', togglePause);
elements.restartButton.addEventListener('click', restart);
elements.endingRestartButton.addEventListener('click', restart);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Escape' && ['running', 'paused'].includes(game.status)) { event.preventDefault(); togglePause(); return; }
  if (event.code === 'Space') {
    if (game.status === 'idle') { event.preventDefault(); start(); }
    else if (game.status === 'intro') { event.preventDefault(); advancePrologue(); }
    else if (game.status === 'paused') { event.preventDefault(); togglePause(); }
    return;
  }
  if (event.code === 'KeyR' && event.target.tagName !== 'INPUT') { restart(); return; }
  const number = Number(event.code.replace('Digit', ''));
  if (game.status === 'running' && number >= 1 && number <= 3) { event.preventDefault(); choose(number - 1); }
});

render();
