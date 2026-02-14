"use strict";

// ===== ИГРОВЫЕ КОНСТАНТЫ =====
var GAME_CONSTANTS = {
  TICK_INTERVAL: 4000,
  FEED_COST: 15,
  FEED_AMOUNT: 30,
  PLAY_INCOME: 10,
  PLAY_HAPPINESS: 20,
  PLAY_HUNGER: 5,
  SLEEP_RESTORE: 10,
  HUNGER_DECAY: 3,
  SLEEP_DECAY: 2,
  HAPPINESS_DECAY: 4,
  STARVATION_DAMAGE: 4,
  BASE_ATTACK: 10,
  BASE_DEFENSE: 5,
  BASE_MAX_HP: 100,
  BASE_MAX_MP: 50,
  LEVEL_UP_XP: 100,
  // --- Добавленные константы для опыта ---
  XP_MODIFIER: 0.5,
  // Множитель (0.5 = в два раза меньше опыта)
  BASE_XP_PER_ACTION: 20,
  // Базовое кол-во опыта за действие
  // ---------------------------------------
  LEVEL_UP_HP_BONUS: 0.5,
  LEVEL_UP_MP_BONUS: 0.1,
  LEVEL_UP_ATK_BONUS: 0.3,
  LEVEL_UP_DEF_BONUS: 0.2,
  MP_REGEN_RATE: 0.5,
  MIN_HP_FOR_BATTLE: 30,
  ESCAPE_CHANCE: 0.1
}; // ===== СЛОЖНОСТЬ =====

var DIFFICULTY = {
  easy: {
    name: "Легкая",
    playerMultiplier: 1.2,
    enemyMultiplier: 0.8,
    xpMultiplier: 0.8,
    coinMultiplier: 0.8
  },
  normal: {
    name: "Нормальная",
    playerMultiplier: 1.0,
    enemyMultiplier: 1.0,
    xpMultiplier: 1.0,
    coinMultiplier: 1.0
  },
  hard: {
    name: "Сложная",
    playerMultiplier: 0.8,
    enemyMultiplier: 1.3,
    xpMultiplier: 1.5,
    coinMultiplier: 1.2
  }
}; // ===== ЭВОЛЮЦИИ ПИТОМЦЕВ =====

var EVOLUTIONS = {
  '🐱': [{
    level: 10,
    evolveTo: '🐆',
    name: "Леопард",
    emoji: '🐆',
    bonus: {
      maxHp: 40,
      atk: 12,
      def: 4,
      mp: 15
    },
    unlockSkills: ['dash']
  }, {
    level: 20,
    evolveTo: '🦁',
    name: "Лев",
    emoji: '🦁',
    bonus: {
      maxHp: 60,
      atk: 18,
      def: 6,
      mp: 20
    },
    unlockSkills: ['roar']
  }, {
    level: 30,
    evolveTo: '🐯',
    name: "Тигр",
    emoji: '🐯',
    bonus: {
      maxHp: 80,
      atk: 24,
      def: 8,
      mp: 25
    },
    unlockSkills: ['quick_strike']
  }, {
    level: 40,
    evolveTo: '🐈‍⬛',
    name: "Тёмный Кот",
    emoji: '🐈‍⬛',
    bonus: {
      maxHp: 100,
      atk: 30,
      def: 10,
      mp: 30
    },
    unlockSkills: ['shadow_claw']
  }, {
    level: 50,
    evolveTo: '🐉',
    name: "Котодракон",
    emoji: '🐉',
    bonus: {
      maxHp: 120,
      atk: 35,
      def: 12,
      mp: 40
    },
    unlockSkills: ['fire_breath']
  }, {
    level: 60,
    evolveTo: '👑',
    name: "Король Зверей",
    emoji: '👑',
    bonus: {
      maxHp: 150,
      atk: 40,
      def: 15,
      mp: 50
    },
    unlockSkills: ['royal_roar']
  }],
  '🐶': [{
    level: 10,
    evolveTo: '🐺',
    name: "Волк",
    emoji: '🐺',
    bonus: {
      maxHp: 50,
      atk: 15,
      def: 8,
      mp: 10
    },
    unlockSkills: ['bite']
  }, {
    level: 20,
    evolveTo: '🐺',
    name: "Вожак-Волк",
    emoji: '🐺',
    bonus: {
      maxHp: 70,
      atk: 20,
      def: 10,
      mp: 15
    },
    unlockSkills: ['quick_bite']
  }, {
    level: 30,
    evolveTo: '🐕‍🦺',
    name: "Дух-Волк",
    emoji: '🐕‍🦺',
    bonus: {
      maxHp: 90,
      atk: 25,
      def: 12,
      mp: 20
    },
    unlockSkills: ['ferocious_bite']
  }, {
    level: 40,
    evolveTo: '🐩',
    name: "Цербер",
    emoji: '🐩',
    bonus: {
      maxHp: 110,
      atk: 30,
      def: 14,
      mp: 25
    },
    unlockSkills: ['triple_bite']
  }, {
    level: 50,
    evolveTo: '🦌',
    name: "Хозяен лес",
    emoji: '🦌',
    bonus: {
      maxHp: 130,
      atk: 35,
      def: 16,
      mp: 30
    },
    unlockSkills: ['antler_smash']
  }, {
    level: 60,
    evolveTo: '🐲',
    name: "Пёс-Дракон",
    emoji: '🐲',
    bonus: {
      maxHp: 160,
      atk: 40,
      def: 18,
      mp: 40
    },
    unlockSkills: ['dragon_bite']
  }],
  '🐦': [{
    level: 10,
    evolveTo: '🦅',
    name: "Орёл",
    emoji: '🦅',
    bonus: {
      maxHp: 35,
      atk: 20,
      def: 3,
      mp: 25
    },
    unlockSkills: ['peck']
  }, {
    level: 20,
    evolveTo: '🦢',
    name: "Духовний Лебедь",
    emoji: '🦢',
    bonus: {
      maxHp: 50,
      atk: 25,
      def: 5,
      mp: 35
    },
    unlockSkills: ['fire_feathers']
  }, {
    level: 30,
    evolveTo: '🦚',
    name: "Жар-птица",
    emoji: '🦚',
    bonus: {
      maxHp: 65,
      atk: 30,
      def: 7,
      mp: 45
    },
    unlockSkills: ['water_splash']
  }, {
    level: 40,
    evolveTo: '🦜',
    name: "Гром-птица",
    emoji: '🦜',
    bonus: {
      maxHp: 80,
      atk: 35,
      def: 9,
      mp: 55
    },
    unlockSkills: ['thunder_strike']
  }, {
    level: 50,
    evolveTo: '🐦‍🔥',
    name: "Феникс ",
    emoji: '🐦‍🔥',
    bonus: {
      maxHp: 95,
      atk: 40,
      def: 11,
      mp: 65
    },
    unlockSkills: ['fire_storm']
  }, {
    level: 60,
    evolveTo: '🐉',
    name: "Дракон-птица",
    emoji: '🐉',
    bonus: {
      maxHp: 120,
      atk: 45,
      def: 13,
      mp: 80
    },
    unlockSkills: ['dragon_flight']
  }],
  '🦎': [{
    level: 10,
    evolveTo: '🐊',
    name: "Крокодил",
    emoji: '🐊',
    bonus: {
      maxHp: 80,
      atk: 18,
      def: 15,
      mp: 10
    },
    unlockSkills: ['crunch']
  }, {
    level: 20,
    evolveTo: '🦕',
    name: "Динозавр",
    emoji: '🦕',
    bonus: {
      maxHp: 100,
      atk: 22,
      def: 18,
      mp: 15
    },
    unlockSkills: ['stomp']
  }, {
    level: 30,
    evolveTo: '🦖',
    name: "Т-Рекс",
    emoji: '🦖',
    bonus: {
      maxHp: 120,
      atk: 26,
      def: 21,
      mp: 20
    },
    unlockSkills: ['mighty_roar']
  }, {
    level: 40,
    evolveTo: '🐉',
    name: "Драконозавр",
    emoji: '🐉',
    bonus: {
      maxHp: 140,
      atk: 30,
      def: 24,
      mp: 25
    },
    unlockSkills: ['fire_breath']
  }, {
    level: 50,
    evolveTo: '🦕',
    name: "Титанозавр",
    emoji: '🦕',
    bonus: {
      maxHp: 160,
      atk: 34,
      def: 27,
      mp: 30
    },
    unlockSkills: ['earthquake']
  }, {
    level: 60,
    evolveTo: '👑',
    name: "Король Динозавров",
    emoji: '👑',
    bonus: {
      maxHp: 200,
      atk: 40,
      def: 30,
      mp: 40
    },
    unlockSkills: ['meteor_strike']
  }],
  '🐲': [{
    level: 10,
    evolveTo: '🐉',
    name: "Дракон",
    emoji: '🐉',
    bonus: {
      maxHp: 70,
      atk: 25,
      def: 8,
      mp: 40
    },
    unlockSkills: ['fireball']
  }, {
    level: 20,
    evolveTo: '🐲',
    name: "Великий Дракон",
    emoji: '🐲',
    bonus: {
      maxHp: 90,
      atk: 30,
      def: 12,
      mp: 50
    },
    unlockSkills: ['fire_breath']
  }, {
    level: 30,
    evolveTo: '🦎',
    name: "Драконид",
    emoji: '🦎',
    bonus: {
      maxHp: 110,
      atk: 35,
      def: 16,
      mp: 60
    },
    unlockSkills: ['poison_spit']
  }, {
    level: 40,
    evolveTo: '🐉',
    name: "Древний Дракон",
    emoji: '🐉',
    bonus: {
      maxHp: 130,
      atk: 40,
      def: 20,
      mp: 70
    },
    unlockSkills: ['dragon_rage']
  }, {
    level: 50,
    evolveTo: '🔥',
    name: "Огненный Дракон",
    emoji: '🔥',
    bonus: {
      maxHp: 150,
      atk: 45,
      def: 24,
      mp: 80
    },
    unlockSkills: ['inferno']
  }, {
    level: 60,
    evolveTo: '👑',
    name: "Драконий Король",
    emoji: '👑',
    bonus: {
      maxHp: 180,
      atk: 50,
      def: 28,
      mp: 100
    },
    unlockSkills: ['apocalypse']
  }],
  '🐍': [{
    level: 10,
    evolveTo: '🐍',
    name: "Василиск",
    emoji: '🐍 ',
    bonus: {
      maxHp: 60,
      atk: 22,
      def: 6,
      mp: 30
    },
    unlockSkills: ['poison']
  }, {
    level: 20,
    evolveTo: '🐉',
    name: "Злая-гадюка",
    emoji: '🐉',
    bonus: {
      maxHp: 80,
      atk: 26,
      def: 9,
      mp: 40
    },
    unlockSkills: ['petrify']
  }, {
    level: 30,
    evolveTo: '🐍',
    name: "Гидра",
    emoji: '🐍',
    bonus: {
      maxHp: 100,
      atk: 30,
      def: 12,
      mp: 50
    },
    unlockSkills: ['multi_bite']
  }, {
    level: 40,
    evolveTo: '🐉',
    name: "Нага",
    emoji: '🐉',
    bonus: {
      maxHp: 120,
      atk: 34,
      def: 15,
      mp: 60
    },
    unlockSkills: ['venom_spray']
  }, {
    level: 50,
    evolveTo: '👑',
    name: "Король Змей",
    emoji: '👑',
    bonus: {
      maxHp: 140,
      atk: 38,
      def: 18,
      mp: 70
    },
    unlockSkills: ['death_coil']
  }, {
    level: 60,
    evolveTo: '🐉',
    name: "Мировой Змей",
    emoji: '🐉',
    bonus: {
      maxHp: 170,
      atk: 42,
      def: 21,
      mp: 85
    },
    unlockSkills: ['world_ender']
  }]
}; // ===== ТИПЫ ПИТОМЦЕВ =====

var PET_TYPES = {
  '🐱': {
    name: "Кот",
    atk: 12,
    def: 3,
    maxHp: 90,
    maxMp: 60,
    crit: 0.15,
    skills: ['dash']
  },
  '🐶': {
    name: "Собака",
    atk: 10,
    def: 8,
    maxHp: 110,
    maxMp: 40,
    crit: 0.10,
    skills: ['bite']
  },
  '🐦': {
    name: "Птица",
    atk: 15,
    def: 2,
    maxHp: 80,
    maxMp: 70,
    crit: 0.20,
    skills: ['peck']
  },
  '🦎': {
    name: "Динозавр",
    atk: 18,
    def: 6,
    maxHp: 120,
    maxMp: 30,
    crit: 0.08,
    skills: ['roar']
  },
  '🐲': {
    name: "Дракон",
    atk: 20,
    def: 4,
    maxHp: 130,
    maxMp: 100,
    crit: 0.12,
    skills: ['fireball']
  },
  '🐍': {
    name: "Змея",
    atk: 16,
    def: 5,
    maxHp: 95,
    maxMp: 50,
    crit: 0.18,
    skills: ['poison']
  }
}; // ===== НАВЫКИ =====

var SKILLS = {
  basic: {
    name: "Базовая атака",
    cost: 0,
    damage: 1.0,
    type: 'physical',
    description: "Обычная атака"
  },
  // Огненные навыки
  fireball: {
    name: "Огненный шар",
    cost: 15,
    damage: 1.8,
    type: 'magic',
    element: 'fire',
    description: "Магическая атака огнем"
  },
  fire_breath: {
    name: "Огненное дыхание",
    cost: 25,
    damage: 2.2,
    type: 'magic',
    element: 'fire',
    description: "Мощная огненная атака"
  },
  inferno: {
    name: "Инферно",
    cost: 40,
    damage: 3.0,
    type: 'magic',
    element: 'fire',
    description: "Всесжигающее пламя"
  },
  // Ледяные навыки
  ice: {
    name: "Ледяная стрела",
    cost: 12,
    damage: 1.6,
    type: 'magic',
    element: 'ice',
    description: "Заморозка противника"
  },
  frost_nova: {
    name: "Ледяная буря",
    cost: 30,
    damage: 2.0,
    type: 'magic',
    element: 'ice',
    description: "Заморозка области"
  },
  // Лечебные навыки
  heal: {
    name: "Лечение",
    cost: 20,
    heal: 40,
    type: 'support',
    description: "Восстановление здоровья"
  },
  regen: {
    name: "Регенерация",
    cost: 25,
    heal: 60,
    type: 'support',
    description: "Постепенное лечение"
  },
  // Физические атаки
  dash: {
    name: "Рывок",
    cost: 8,
    damage: 1.3,
    type: 'physical',
    description: "Быстрая атака"
  },
  bite: {
    name: "Укус",
    cost: 10,
    damage: 1.6,
    type: 'physical',
    description: "Сильный укус"
  },
  peck: {
    name: "Клюв",
    cost: 7,
    damage: 1.4,
    type: 'physical',
    description: "Точный удар клювом"
  },
  stomp: {
    name: "Топот",
    cost: 12,
    damage: 1.8,
    type: 'physical',
    description: "Сокрушающий удар"
  },
  roar: {
    name: "Рёв",
    cost: 15,
    damage: 1.5,
    type: 'physical',
    description: "Оглушающий рёв"
  },
  // Ядовитые атаки
  poison: {
    name: "Яд",
    cost: 10,
    damage: 0.8,
    type: 'magic',
    element: 'poison',
    description: "Наносит урон со временем",
    dot: true
  },
  venom_spray: {
    name: "Брызги яда",
    cost: 20,
    damage: 1.2,
    type: 'magic',
    element: 'poison',
    description: "Отравляет противника"
  },
  // Специальные навыки
  quick_strike: {
    name: "Быстрый удар",
    cost: 6,
    damage: 1.2,
    type: 'physical',
    description: "Очень быстрая атака"
  },
  shadow_claw: {
    name: "Теневой коготь",
    cost: 18,
    damage: 2.0,
    type: 'magic',
    element: 'dark',
    description: "Атака из тени"
  },
  royal_roar: {
    name: "Королевский рёв",
    cost: 30,
    damage: 2.5,
    type: 'physical',
    description: "Устрашающий рёв"
  },
  triple_bite: {
    name: "Тройной укус",
    cost: 25,
    damage: 2.2,
    type: 'physical',
    description: "Три быстрых укуса"
  },
  fire_feathers: {
    name: "Огненные перья",
    cost: 20,
    damage: 1.8,
    type: 'magic',
    element: 'fire',
    description: "Атака огненными перьями"
  },
  thunder_strike: {
    name: "Удар грома",
    cost: 22,
    damage: 2.0,
    type: 'magic',
    element: 'lightning',
    description: "Электрическая атака"
  },
  dragon_rage: {
    name: "Ярость дракона",
    cost: 35,
    damage: 2.8,
    type: 'magic',
    element: 'fire',
    description: "Мощная атака дракона"
  },
  earthquake: {
    name: "Землетрясение",
    cost: 30,
    damage: 2.3,
    type: 'physical',
    description: "Потрясает землю"
  },
  meteor_strike: {
    name: "Удар метеора",
    cost: 50,
    damage: 3.5,
    type: 'magic',
    element: 'fire',
    description: "Призывает метеор"
  },
  world_ender: {
    name: "Конец света",
    cost: 60,
    damage: 4.0,
    type: 'magic',
    element: 'dark',
    description: "Апокалиптическая атака"
  }
}; // ===== РАСШИРЕННЫЙ СПИСОК ВРАГОВ (30 штук) =====

var ENEMIES = [// Уровень 1-3
{
  n: "Слизень",
  e: "🟢",
  hp: 50,
  atk: 10,
  def: 1,
  xp: 10,
  coins: 1,
  level: 1
}, {
  n: "Крыса",
  e: "🐀",
  hp: 65,
  atk: 17,
  def: 1,
  xp: 9,
  coins: 2,
  level: 1
}, {
  n: "Летучая мышь",
  e: "🦇",
  hp: 35,
  atk: 18,
  def: 0,
  xp: 8,
  coins: 11,
  level: 1
}, {
  n: "Паук",
  e: "🕷️",
  hp: 50,
  atk: 16,
  def: 2,
  xp: 8,
  coins: 4,
  level: 2
}, {
  n: "Жаба",
  e: "🐸",
  hp: 55,
  atk: 15,
  def: 3,
  xp: 8,
  coins: 5,
  level: 2
}, {
  n: "Змея",
  e: "🐍",
  hp: 48,
  atk: 19,
  def: 1,
  xp: 8,
  coins: 6,
  level: 2
}, {
  n: "Ворон",
  e: "🐦‍⬛",
  hp: 40,
  atk: 10,
  def: 0,
  xp: 2,
  coins: 2,
  level: 2
}, {
  n: "Скорпион",
  e: "🦂",
  hp: 70,
  atk: 18,
  def: 4,
  xp: 5,
  coins: 8,
  level: 3
}, {
  n: "Крот",
  e: "🦫",
  hp: 80,
  atk: 16,
  def: 5,
  xp: 3,
  coins: 7,
  level: 3
}, {
  n: "Лиса",
  e: "🦊",
  hp: 92,
  atk: 11,
  def: 2,
  xp: 2,
  coins: 9,
  level: 3
}, // Уровень 4-6
{
  n: "Гоблин-разведчик",
  e: "👺",
  hp: 100,
  atk: 12,
  def: 3,
  xp: 0.1,
  coins: 22,
  level: 4
}, {
  n: "Скелет-воин",
  e: "💀",
  hp: 70,
  atk: 23,
  def: 25,
  xp: 0.1,
  coins: 25,
  level: 4
}, {
  n: "Оборотень",
  e: "🐺",
  hp: 80,
  atk: 15,
  def: 4,
  xp: 0.1,
  coins: 28,
  level: 5
}, {
  n: "Вампир-летучая мышь",
  e: "🦇🧛",
  hp: 155,
  atk: 16,
  def: 5,
  xp: 0.1,
  coins: 26,
  level: 5
}, {
  n: "Минотавр-новобранец",
  e: "🐮",
  hp: 90,
  atk: 14,
  def: 7,
  xp: 0.1,
  coins: 30,
  level: 6
}, {
  n: "Элементаль воды",
  e: "💧",
  hp: 75,
  atk: 17,
  def: 3,
  xp: 0.1,
  coins: 29,
  level: 6
}, {
  n: "Горгулья",
  e: "🗿",
  hp: 85,
  atk: 13,
  def: 8,
  xp: 0.1,
  coins: 32,
  level: 6
}, {
  n: "Темный эльф",
  e: "🧝‍♂️",
  hp: 60,
  atk: 19,
  def: 3,
  xp: 0.1,
  coins: 31,
  level: 6
}, {
  n: "Огненный дух",
  e: "🔥",
  hp: 70,
  atk: 22,
  def: 1,
  xp: 0.1,
  coins: 33,
  level: 6
}, {
  n: "Ледяной призрак",
  e: "❄️👻",
  hp: 65,
  atk: 18,
  def: 2,
  xp: 0.1,
  coins: 28,
  level: 6
}, // Уровень 7-10
{
  n: "Циклоп",
  e: "👁️",
  hp: 120,
  atk: 25,
  def: 8,
  xp: 80,
  coins: 45,
  level: 7
}, {
  n: "Химера",
  e: "🦁🐐🐍",
  hp: 110,
  atk: 28,
  def: 6,
  xp: 85,
  coins: 48,
  level: 8
}, {
  n: "Мантикора",
  e: "🦂🦁",
  hp: 130,
  atk: 26,
  def: 9,
  xp: 90,
  coins: 50,
  level: 8
}, {
  n: "Грифон",
  e: "🦅🦁",
  hp: 115,
  atk: 30,
  def: 7,
  xp: 88,
  coins: 49,
  level: 9
}, {
  n: "Кракен",
  e: "🐙",
  hp: 150,
  atk: 24,
  def: 12,
  xp: 95,
  coins: 55,
  level: 9
}, {
  n: "Феникс",
  e: "🔥🦅",
  hp: 100,
  atk: 35,
  def: 4,
  xp: 92,
  coins: 52,
  level: 9
}, {
  n: "Дракон-подросток",
  e: "🐉",
  hp: 180,
  atk: 32,
  def: 10,
  xp: 110,
  coins: 65,
  level: 10
}, {
  n: "Древний голем",
  e: "🗿⚡",
  hp: 200,
  atk: 28,
  def: 15,
  xp: 120,
  coins: 70,
  level: 10
}, {
  n: "Архимаг",
  e: "🧙‍♂️✨",
  hp: 95,
  atk: 40,
  def: 5,
  xp: 105,
  coins: 60,
  level: 10
}, {
  n: "Повелитель зверей",
  e: "👑🐺",
  hp: 140,
  atk: 33,
  def: 11,
  xp: 115,
  coins: 68,
  level: 10
}]; // ===== РАСШИРЕННЫЙ СПИСОК БОССОВ (15 штук) =====

var BOSSES = [// Ранние боссы (уровень 5-10)
{
  n: "Король Гоблинов",
  e: "👑👺",
  hp: 300,
  atk: 40,
  def: 15,
  xp: 250,
  coins: 200,
  level: 5,
  special: "Призывает 2 гоблинов каждые 3 хода",
  reward: "Корона гоблинов (+15 ATK, +5 DEF)"
}, {
  n: "Королева Пауков",
  e: "👑🕷️",
  hp: 280,
  atk: 45,
  def: 12,
  xp: 280,
  coins: 220,
  level: 6,
  special: "Опутывает паутиной (-20% скорости атаки)",
  reward: "Паучий шелк (+10% шанс уклонения)"
}, {
  n: "Лорд Скелетов",
  e: "💀👑",
  hp: 350,
  atk: 42,
  def: 18,
  xp: 320,
  coins: 250,
  level: 7,
  special: "Воскрешает павших скелетов",
  reward: "Костяной щит (+20 DEF)"
}, {
  n: "Владыка Теней",
  e: "👻👑",
  hp: 320,
  atk: 50,
  def: 14,
  xp: 350,
  coins: 280,
  level: 8,
  special: "Крадет 15% HP игрока каждые 4 хода",
  reward: "Теневой плащ (+25 MP, +10% крит)"
}, {
  n: "Драконид",
  e: "🐲🔥",
  hp: 500,
  atk: 55,
  def: 22,
  xp: 450,
  coins: 350,
  level: 9,
  special: "Огненное дыхание каждые 2 хода",
  reward: "Чешуя дракона (+25 DEF, +10% сопротивление огню)"
}, // Средние боссы (уровень 11-20)
{
  n: "Царь Циклопов",
  e: "👁️👑",
  hp: 600,
  atk: 65,
  def: 28,
  xp: 550,
  coins: 450,
  level: 12,
  special: "Сокрушающий удар (оглушает на 1 ход)",
  reward: "Око циклопа (+30 ATK, +5% шанс крита)"
}, {
  n: "Королева Химер",
  e: "👑🦁🐐🐍",
  hp: 550,
  atk: 70,
  def: 25,
  xp: 580,
  coins: 480,
  level: 14,
  special: "Три атаки за ход",
  reward: "Сердце химеры (+20 ATK, +15 DEF, +20 HP)"
}, {
  n: "Повелитель Грифонов",
  e: "👑🦅🦁",
  hp: 520,
  atk: 75,
  def: 22,
  xp: 600,
  coins: 500,
  level: 16,
  special: "Атака с воздуха (игнорирует 50% защиты)",
  reward: "Перо грифона (+40 ATK, +20% скорость атаки)"
}, {
  n: "Владыка Кракенов",
  e: "👑🐙",
  hp: 800,
  atk: 60,
  def: 35,
  xp: 700,
  coins: 600,
  level: 18,
  special: "Щупальца (захватывает на 2 хода)",
  reward: "Щупальце кракена (+50 HP, +15% шанс оглушения)"
}, {
  n: "Король Фениксов",
  e: "👑🔥🦅",
  hp: 650,
  atk: 80,
  def: 20,
  xp: 750,
  coins: 650,
  level: 20,
  special: "Возрождение (воскресает 1 раз с 50% HP)",
  reward: "Перо феникса (+100 HP, +20% регенерация)"
}, // Поздние боссы (уровень 21-30)
{
  n: "Древний Дракон",
  e: "🐉✨",
  hp: 1200,
  atk: 90,
  def: 40,
  xp: 1000,
  coins: 1000,
  level: 25,
  special: "Дыхание дракона (огненный и ледяной урон)",
  reward: "Сердце дракона (+100 ATK, +50 DEF, +200 HP)"
}, {
  n: "Титан Камня",
  e: "🗿⚡",
  hp: 1500,
  atk: 75,
  def: 60,
  xp: 1100,
  coins: 1200,
  level: 28,
  special: "Землетрясение (урон всей команде)",
  reward: "Ядро титана (+150 DEF, +300 HP, +20% сопротивление)"
}, {
  n: "Повелитель Бездны",
  e: "🌀😈",
  hp: 1400,
  atk: 100,
  def: 45,
  xp: 1300,
  coins: 1500,
  level: 30,
  special: "Поглощение маны (крадет 30 MP каждый ход)",
  reward: "Кристалл бездны (+150 MP, +50% регенерация маны)"
}, {
  n: "Бог Хаоса",
  e: "🌪️👁️",
  hp: 2000,
  atk: 120,
  def: 50,
  xp: 2000,
  coins: 2500,
  level: 35,
  special: "Хаотическая буря (случайные эффекты каждый ход)",
  reward: "Фрагмент хаоса (+200 ATK, +100 DEF, +500 HP)"
}, {
  n: "Верховный Дракон",
  e: "🐉👑🌟",
  hp: 3000,
  atk: 150,
  def: 70,
  xp: 3000,
  coins: 5000,
  level: 40,
  special: "Апокалипсис (массовый урон каждые 5 ходов)",
  reward: "Душа дракона (Легендарный предмет: +300 ATK, +200 DEF, +1000 HP)"
}]; // ===== ПРЕДМЕТЫ =====

var ITEMS = {
  health_potion: {
    id: 'health_potion',
    name: "Зелье здоровья",
    emoji: "🧪",
    price: 50,
    effect: {
      type: 'heal',
      value: 75
    },
    description: "Восстанавливает 75 HP"
  },
  mana_potion: {
    id: 'mana_potion',
    name: "Зелье маны",
    emoji: "🔮",
    price: 40,
    effect: {
      type: 'mp',
      value: 50
    },
    description: "Восстанавливает 50 MP"
  },
  strength_potion: {
    id: 'strength_potion',
    name: "Зелье силы",
    emoji: "💪",
    price: 100,
    effect: {
      type: 'buff',
      stat: 'atk',
      value: 20,
      duration: 300
    },
    description: "+20 ATK на 5 минут"
  },
  defense_potion: {
    id: 'defense_potion',
    name: "Зелье защиты",
    emoji: "🛡️",
    price: 90,
    effect: {
      type: 'buff',
      stat: 'def',
      value: 15,
      duration: 300
    },
    description: "+15 DEF на 5 минут"
  },
  pet_food: {
    id: 'pet_food',
    name: "Корм для питомца",
    emoji: "🍖",
    price: 25,
    effect: {
      type: 'feed',
      value: 60
    },
    description: "+60 сытости"
  },
  lucky_charm: {
    id: 'lucky_charm',
    name: "Талисман удачи",
    emoji: "🍀",
    price: 200,
    effect: {
      type: 'buff',
      stat: 'crit',
      value: 0.15,
      duration: 600
    },
    description: "+15% шанс крита на 10 минут"
  },
  // Эпические предметы от боссов
  goblin_crown: {
    id: 'goblin_crown',
    name: "Корона гоблинов",
    emoji: "👑",
    price: 500,
    effect: {
      type: 'perm_buff',
      stats: {
        atk: 15,
        def: 5
      }
    },
    description: "Постоянно: +15 ATK, +5 DEF"
  },
  spider_silk: {
    id: 'spider_silk',
    name: "Паучий шелк",
    emoji: "🕸️",
    price: 550,
    effect: {
      type: 'perm_buff',
      stats: {
        dodge: 0.10
      }
    },
    description: "Постоянно: +10% шанс уклонения"
  },
  bone_shield: {
    id: 'bone_shield',
    name: "Костяной щит",
    emoji: "🛡️💀",
    price: 600,
    effect: {
      type: 'perm_buff',
      stats: {
        def: 20
      }
    },
    description: "Постоянно: +20 DEF"
  },
  shadow_cloak: {
    id: 'shadow_cloak',
    name: "Теневой плащ",
    emoji: "👻",
    price: 700,
    effect: {
      type: 'perm_buff',
      stats: {
        maxMp: 25,
        crit: 0.10
      }
    },
    description: "Постоянно: +25 Max MP, +10% крит"
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: "Чешуя дракона",
    emoji: "🐲",
    price: 800,
    effect: {
      type: 'perm_buff',
      stats: {
        def: 25,
        fireResist: 0.10
      }
    },
    description: "Постоянно: +25 DEF, +10% сопротивление огню"
  },
  cyclops_eye: {
    id: 'cyclops_eye',
    name: "Око циклопа",
    emoji: "👁️",
    price: 900,
    effect: {
      type: 'perm_buff',
      stats: {
        atk: 30,
        crit: 0.05
      }
    },
    description: "Постоянно: +30 ATK, +5% шанс крита"
  },
  chimera_heart: {
    id: 'chimera_heart',
    name: "Сердце химеры",
    emoji: "💖🦁",
    price: 1000,
    effect: {
      type: 'perm_buff',
      stats: {
        atk: 20,
        def: 15,
        maxHp: 20
      }
    },
    description: "Постоянно: +20 ATK, +15 DEF, +20 HP"
  },
  griffin_feather: {
    id: 'griffin_feather',
    name: "Перо грифона",
    emoji: "🪶🦅",
    price: 1100,
    effect: {
      type: 'perm_buff',
      stats: {
        atk: 40,
        attackSpeed: 0.20
      }
    },
    description: "Постоянно: +40 ATK, +20% скорость атаки"
  },
  kraken_tentacle: {
    id: 'kraken_tentacle',
    name: "Щупальце кракена",
    emoji: "🐙",
    price: 1200,
    effect: {
      type: 'perm_buff',
      stats: {
        maxHp: 50,
        stunChance: 0.15
      }
    },
    description: "Постоянно: +50 HP, +15% шанс оглушения"
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: "Перо феникса",
    emoji: "🪶🔥",
    price: 1300,
    effect: {
      type: 'perm_buff',
      stats: {
        maxHp: 100,
        regen: 0.20
      }
    },
    description: "Постоянно: +100 HP, +20% регенерация"
  },
  dragon_heart: {
    id: 'dragon_heart',
    name: "Сердце дракона",
    emoji: "💖🐉",
    price: 2000,
    effect: {
      type: 'perm_buff',
      stats: {
        atk: 100,
        def: 50,
        maxHp: 200
      }
    },
    description: "Постоянно: +100 ATK, +50 DEF, +200 HP"
  },
  titan_core: {
    id: 'titan_core',
    name: "Ядро титана",
    emoji: "💎🗿",
    price: 2500,
    effect: {
      type: 'perm_buff',
      stats: {
        def: 150,
        maxHp: 300,
        resist: 0.20
      }
    },
    description: "Постоянно: +150 DEF, +300 HP, +20% сопротивление"
  },
  abyss_crystal: {
    id: 'abyss_crystal',
    name: "Кристалл бездны",
    emoji: "💎🌀",
    price: 3000,
    effect: {
      type: 'perm_buff',
      stats: {
        maxMp: 150,
        manaRegen: 0.50
      }
    },
    description: "Постоянно: +150 MP, +50% регенерация маны"
  },
  chaos_fragment: {
    id: 'chaos_fragment',
    name: "Фрагмент хаоса",
    emoji: "💎🌪️",
    price: 4000,
    effect: {
      type: 'perm_buff',
      stats: {
        atk: 200,
        def: 100,
        maxHp: 500
      }
    },
    description: "Постоянно: +200 ATK, +100 DEF, +500 HP"
  },
  dragon_soul: {
    id: 'dragon_soul',
    name: "Душа дракона",
    emoji: "💎🐉🌟",
    price: 10000,
    effect: {
      type: 'perm_buff',
      stats: {
        atk: 300,
        def: 200,
        maxHp: 1000,
        crit: 0.20,
        dodge: 0.10
      }
    },
    description: "Легендарный: +300 ATK, +200 DEF, +1000 HP, +20% крит, +10% уклонение"
  },
  revival_token: {
    id: 'revival_token',
    name: "Токен воскрешения",
    emoji: "💫",
    price: 5000,
    effect: {
      type: 'revive',
      value: 10
    },
    description: "Воскрешает с 10% HP"
  },
  xp_boost: {
    id: 'xp_boost',
    name: "Усилитель опыта",
    emoji: "🌟",
    price: 9000,
    effect: {
      type: 'buff',
      stat: 'xp_gain',
      value: 1.5,
      duration: 600
    },
    description: "+50% опыта на 10 минут"
  }
};
var SHOP_ITEMS = Object.values(ITEMS).filter(function (item) {
  return !item.effect.type.includes('perm_buff');
}); // ===== КВЕСТЫ =====

var QUESTS = [{
  id: 1,
  title: "Новичок",
  description: "Достигните 5 уровня",
  type: 'level',
  target: 5,
  reward: {
    coins: 150,
    xp: 100
  }
}, {
  id: 2,
  title: "Охотник",
  description: "Победите 10 врагов",
  type: 'kill',
  target: 10,
  reward: {
    coins: 200,
    xp: 150
  }
}, {
  id: 3,
  title: "Богач",
  description: "Соберите 1000 монет",
  type: 'coins',
  target: 1000,
  reward: {
    coins: 300,
    xp: 200
  }
}, {
  id: 4,
  title: "Эволюция",
  description: "Эволюционируйте впервые",
  type: 'evolve',
  target: 1,
  reward: {
    coins: 500,
    xp: 300
  }
}, {
  id: 5,
  title: "Босс",
  description: "Победите первого босса",
  type: 'boss',
  target: 1,
  reward: {
    coins: 800,
    xp: 500
  }
}, {
  id: 6,
  title: "Легенда",
  description: "Достигните 30 уровня",
  type: 'level',
  target: 30,
  reward: {
    coins: 2000,
    xp: 1000
  }
}];
//# sourceMappingURL=data.dev.js.map
