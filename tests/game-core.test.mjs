import test from 'node:test';
import assert from 'node:assert/strict';
import { DialogueGame, NODES, ENDINGS, PROLOGUE } from '../game-core.js';

function enterDialogue(game) {
  assert.equal(game.start(), true);
  for (let index = 0; index < PROLOGUE.length; index += 1) assert.equal(game.advanceIntro(), true);
  assert.equal(game.status, 'running');
}

test('dialogue tree has valid destinations and three choices per scene', () => {
  for (const [id, node] of Object.entries(NODES)) {
    assert.equal(node.choices.length, 3, `${id} has three choices`);
    for (const choice of node.choices) {
      if (!node.final) assert.ok(NODES[choice.next], `${id} points to ${choice.next}`);
      else assert.ok(choice.endingIntent);
    }
  }
});

test('initial snapshot matches documented resources and progress', () => {
  const state = new DialogueGame().snapshot();
  assert.equal(state.status, 'idle');
  assert.equal(state.nodeId, 'call');
  assert.equal(state.trust, 2);
  assert.equal(state.signal, 3);
  assert.equal(state.time, 6);
  assert.equal(state.progress, 0);
  assert.equal(state.prologueIndex, 0);
  assert.deepEqual(state.history, []);
});

test('prologue advances through three frames before dialogue starts', () => {
  const game = new DialogueGame();
  assert.equal(game.start(), true);
  assert.equal(game.status, 'intro');
  assert.equal(game.choose(0), false);
  assert.equal(game.snapshot().prologue.title, 'Свет стал ловушкой');
  assert.equal(game.advanceIntro(), true);
  assert.equal(game.snapshot().prologue.title, 'Дамба не выдержала');
  assert.equal(game.advanceIntro(), true);
  assert.equal(game.snapshot().prologue.title, 'Курьер выходит в эфир');
  assert.equal(game.advanceIntro(), true);
  assert.equal(game.status, 'running');
  assert.equal(game.advanceIntro(), false);
});

test('game exposes explicit lifecycle and blocks choices while paused', () => {
  const game = new DialogueGame();
  assert.equal(game.status, 'idle');
  assert.equal(game.choose(0), false);
  enterDialogue(game);
  assert.equal(game.pause(), true);
  assert.equal(game.choose(0), false);
  assert.equal(game.resume(), true);
  assert.equal(game.choose(0), true);
});

test('cooperative route reaches together ending', () => {
  const game = new DialogueGame(); enterDialogue(game);
  [0, 1, 0, 0, 0].forEach(choice => game.choose(choice));
  assert.equal(game.endingId, 'together');
  assert.equal(game.status, 'finished');
});

test('truth route reaches truth ending', () => {
  const game = new DialogueGame(); enterDialogue(game);
  [2, 1, 0, 2, 1].forEach(choice => game.choose(choice));
  assert.equal(game.endingId, 'truth');
});

test('departure route reaches lone ending', () => {
  const game = new DialogueGame(); enterDialogue(game);
  [1, 1, 1, 1, 2].forEach(choice => game.choose(choice));
  assert.equal(game.endingId, 'lone');
});

test('broken route reaches silence ending', () => {
  const game = new DialogueGame(); enterDialogue(game);
  [0, 2, 2, 0, 0].forEach(choice => game.choose(choice));
  assert.equal(game.endingId, 'silence');
});

test('restart clears route and resources', () => {
  const game = new DialogueGame(); enterDialogue(game); game.choose(0); game.choose(0);
  const reset = game.reset();
  assert.equal(reset.status, 'idle'); assert.equal(reset.history.length, 0);
  assert.equal(reset.trust, 2); assert.equal(reset.signal, 3); assert.equal(reset.time, 6);
  assert.deepEqual(Object.keys(ENDINGS).sort(), ['lone', 'silence', 'together', 'truth']);
});

test('all 243 complete routes terminate and every ending is reachable', () => {
  const reached = new Set();
  for (let route = 0; route < 3 ** 5; route += 1) {
    const game = new DialogueGame(); enterDialogue(game);
    let encoded = route;
    for (let step = 0; step < 5; step += 1) {
      assert.equal(game.choose(encoded % 3), true);
      encoded = Math.floor(encoded / 3);
    }
    assert.equal(game.status, 'finished');
    reached.add(game.endingId);
  }
  assert.deepEqual([...reached].sort(), Object.keys(ENDINGS).sort());
});
