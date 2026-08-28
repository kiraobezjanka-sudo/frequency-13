const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const ENDINGS = {
  together: {
    title: 'Рассвет на двоих', symbol: '☼', tone: 'gold',
    text: 'Лада встречает Севера у самой линзы. Катушка вспыхивает, и маяк проводит корабли между крышами. Когда вода отступает, город помнит не героев по отдельности, а голос, который они разделили.'
  },
  truth: {
    title: 'Город без масок', symbol: '◉', tone: 'cyan',
    text: 'Вместо приказа в эфир уходит правда: дамба сломана, эвакуацию скрывали. Сотни приёмников просыпаются разом. Маяк гаснет, но город наконец начинает говорить сам.'
  },
  lone: {
    title: 'Одинокий огонь', symbol: '△', tone: 'violet',
    text: 'Север оставляет катушку у двери и уходит по крышам. Лада запускает маяк одна. Свет спасает порт, но каждую ночь на частоте 13 она оставляет ему короткое: «Я всё ещё слушаю».'
  },
  silence: {
    title: 'Море из помех', symbol: '≈', tone: 'red',
    text: 'Последняя фраза рассыпается белым шумом. В темноте вспыхивают только ручные фонари. Город переживёт ночь, но история о частоте 13 останется слухом, который никто не сумел доказать.'
  }
};

export const PROLOGUE = [
  {
    date: 'Год назад',
    title: 'Свет стал ловушкой',
    text: 'Во время эвакуации кто-то подменил координаты. Луч маяка повёл корабли не к гавани, а прямо на старое минное поле. Инженер Лада успела погасить свет, но город обвинил её в панике.',
    fact: 'Лада осталась в башне, чтобы однажды доказать: маяк можно использовать безопасно.',
    symbol: '✕', art: 'storm'
  },
  {
    date: 'Сегодня · 00:07',
    title: 'Дамба не выдержала',
    text: 'Нижние улицы уже под водой. Без работающего маяка спасательные лодки не пройдут между крышами, а официальное радио продолжает уверять, что опасности нет.',
    fact: 'Чтобы запустить маяк, нужна синяя катушка питания — последняя осталась на другом конце города.',
    symbol: '≈', art: 'flood'
  },
  {
    date: '00:13 · до волны 6 минут',
    title: 'Курьер выходит в эфир',
    text: 'Север украл катушку со склада патруля и теперь несёт её Ладе. Они никогда не встречались. Между ними — затопленный город и запрещённая радиочастота 13.',
    fact: 'Помогите Северу добраться до башни, заслужите доверие и решите, какой сигнал услышит город.',
    symbol: '13', art: 'radio'
  }
];

export const NODES = {
  call: {
    scene: '01 · Неизвестный голос', speaker: 'Север', role: 'Вы отвечаете за Ладу', active: 'lada',
    text: '«Маяк, ответь. Я на крыше старого архива. У меня синяя катушка и вода уже на лестнице. Ты правда умеешь зажигать это чудовище?»',
    choices: [
      { text: '«Умею. Но сначала назови настоящее имя.»', next: 'route', effects: { trust: 1 }, note: 'Честность сближает' },
      { text: '«Если катушка цела — беги. Знакомиться будем на суше.»', next: 'route', effects: { time: 1 }, note: 'Вы выигрываете минуту' },
      { text: '«Чудовищами я занимаюсь. С людьми сложнее.»', next: 'route', effects: { signal: 1 }, note: 'Голос становится яснее' }
    ]
  },
  route: {
    scene: '02 · Две дороги', speaker: 'Лада', role: 'Вы отвечаете за Севера', active: 'sever',
    text: '«До маяка два пути. Верхний мост быстрее, но его видно патрулю. Внизу безопаснее — если тоннель ещё не затопило.»',
    choices: [
      { text: '«Иду по мосту. Не отключайся — будешь моими глазами.»', next: 'memory', effects: { trust: 1, time: 1, signal: -1 }, flags: { coil: true }, note: 'Быстро, но связь слабеет' },
      { text: '«Ныряю в тоннель. У тишины хотя бы нет винтовок.»', next: 'memory', effects: { time: -1, signal: 1 }, flags: { coil: true }, note: 'Медленно, зато сигнал чище' },
      { text: '«Сначала скажи, почему маяк выключили.»', next: 'memory', effects: { trust: -1, time: -1 }, flags: { suspicious: true, coil: true }, note: 'Ответ будет стоить времени' }
    ]
  },
  memory: {
    scene: '03 · Ложный приказ', speaker: 'Север', role: 'Вы отвечаете за Ладу', active: 'lada',
    text: '«Я видел приказ об отключении. Там твоя подпись, Лада. Если маяк спасает людей — почему ты сама погасила его год назад?»',
    choices: [
      { text: '«Потому что свет вёл корабли прямо на минное поле.»', next: 'door', effects: { trust: 2, signal: -1 }, flags: { confessed: true }, note: 'Тяжёлая правда' },
      { text: '«Приказ подделали. Я просто не стала спорить с вооружёнными людьми.»', next: 'door', effects: { trust: 0 }, flags: { halfTruth: true }, note: 'Не вся правда' },
      { text: '«Не трать дыхание на прошлое. Смотри под ноги.»', next: 'door', effects: { trust: -2, time: 1 }, note: 'Разговор окончен' }
    ]
  },
  door: {
    scene: '04 · У двери маяка', speaker: 'Лада', role: 'Вы отвечаете за Севера', active: 'sever',
    text: '«Я слышу тебя за шлюзом. Но дверь заклинило, а волна уже внизу. Катушку можно передать через вентиляцию — или попробовать выбить дверь.»',
    choices: [
      { text: '«Отойди. Я не тащил эту штуку, чтобы уйти у порога.»', next: 'broadcast', effects: { trust: 1, time: -1 }, flags: { entered: true }, note: 'Рискнуть ради встречи' },
      { text: '«Лови катушку. Кто-то из нас должен выбраться.»', next: 'broadcast', effects: { signal: 1 }, flags: { separated: true }, note: 'Маяк получит питание' },
      { text: '«Сначала открой аварийный канал. Люди должны услышать нас.»', next: 'broadcast', effects: { signal: 1, time: -1 }, flags: { openChannel: true }, note: 'Город подключается к эфиру' }
    ]
  },
  broadcast: {
    scene: '05 · Последняя передача', speaker: 'Частота 13', role: 'Последний выбор', active: 'both',
    text: 'Катушка гудит. До прилива остаются секунды. В эфир можно отправить навигационный луч, признание о старой катастрофе или одну последнюю личную фразу.',
    final: true,
    choices: [
      { text: '«Север, входи. Зажжём его вместе.»', endingIntent: 'together', note: 'Довериться друг другу' },
      { text: '«Всем, кто слышит: нам лгали о дамбе.»', endingIntent: 'truth', note: 'Рассказать правду городу' },
      { text: '«Бери лодку, Север. Я закончу одна.»', endingIntent: 'leave', note: 'Спасти хотя бы одного' }
    ]
  }
};

export class DialogueGame {
  constructor() { this.reset(); }

  reset() {
    this.status = 'idle';
    this.prologueIndex = 0;
    this.nodeId = 'call';
    this.trust = 2;
    this.signal = 3;
    this.time = 6;
    this.flags = { coil: false, confessed: false, suspicious: false, halfTruth: false, entered: false, separated: false, openChannel: false };
    this.history = [];
    this.endingId = null;
    return this.snapshot();
  }

  start() {
    if (this.status !== 'idle') return false;
    this.status = 'intro';
    return true;
  }

  advanceIntro() {
    if (this.status !== 'intro') return false;
    if (this.prologueIndex < PROLOGUE.length - 1) this.prologueIndex += 1;
    else this.status = 'running';
    return true;
  }

  pause() {
    if (this.status !== 'running') return false;
    this.status = 'paused';
    return true;
  }

  resume() {
    if (this.status !== 'paused') return false;
    this.status = 'running';
    return true;
  }

  choose(index) {
    if (this.status !== 'running') return false;
    const node = NODES[this.nodeId];
    const choice = node?.choices[index];
    if (!choice) return false;

    this.history.push({ nodeId: this.nodeId, choice: index, text: choice.text });
    for (const [key, delta] of Object.entries(choice.effects || {})) {
      this[key] = clamp(this[key] + delta, key === 'time' ? 0 : 0, key === 'time' ? 8 : 5);
    }
    Object.assign(this.flags, choice.flags || {});

    if (node.final) {
      this.endingId = this.resolveEnding(choice.endingIntent);
      this.status = 'finished';
    } else {
      this.nodeId = choice.next;
    }
    return true;
  }

  resolveEnding(intent) {
    if (this.time <= 0 || this.signal <= 0) return 'silence';
    if (intent === 'together' && this.flags.entered && this.flags.coil && this.trust >= 4 && this.signal >= 2) return 'together';
    if (intent === 'truth' && this.flags.confessed && (this.flags.openChannel || this.signal >= 4)) return 'truth';
    if (intent === 'leave' && this.flags.coil && this.signal >= 2) return 'lone';
    return 'silence';
  }

  snapshot() {
    return {
      status: this.status, nodeId: this.nodeId, node: NODES[this.nodeId], trust: this.trust,
      prologueIndex: this.prologueIndex, prologue: PROLOGUE[this.prologueIndex],
      signal: this.signal, time: this.time, flags: { ...this.flags }, history: [...this.history],
      endingId: this.endingId, ending: this.endingId ? ENDINGS[this.endingId] : null,
      progress: this.status === 'finished' ? 100 : Math.round((Object.keys(NODES).indexOf(this.nodeId) / (Object.keys(NODES).length - 1)) * 100)
    };
  }
}
