// Един и същ модел за всички бизнеси. 0 = неделя, 1 = понеделник.
const weekdays = {
  1: [[540, 1080]],
  2: [[540, 1080]],
  3: [[540, 1080]],
  4: [[540, 1080]],
  5: [[540, 1080]],
};
export const businesses = [
  {
    id: "salon",
    name: "Студио Линия",
    type: "Салон",
    icon: "✂",
    description: "Лично време за нова визия.",
    resourceLabel: "Специалист",
    step: 30,
    durations: [30, 60, 90],
    hours: { ...weekdays, 6: [[600, 960]] },
    resources: [
      { id: "maria", name: "Мария · Фризьор", capacity: 1 },
      { id: "elena", name: "Елена · Стилист", capacity: 1 },
    ],
  },
  {
    id: "clinic",
    name: "Медика",
    type: "Кабинет",
    icon: "✚",
    description: "Подреден график за по-добра грижа.",
    resourceLabel: "Кабинет",
    step: 15,
    durations: [15, 30, 60],
    hours: Object.fromEntries(
      [1, 2, 3, 4, 5].map((day) => [
        day,
        [
          [480, 720],
          [780, 1020],
        ],
      ]),
    ),
    resources: [
      { id: "room-1", name: "Кабинет 1 · Общ преглед", capacity: 1 },
      { id: "room-2", name: "Кабинет 2 · Консултация", capacity: 1 },
    ],
  },
  {
    id: "studio",
    name: "Движение",
    type: "Спортна зала",
    icon: "◎",
    description: "Повече движение. Място за всички.",
    resourceLabel: "Зала",
    step: 30,
    durations: [60, 90],
    hours: Object.fromEntries(
      [0, 1, 2, 3, 4, 5, 6].map((day) => [day, [[480, 1200]]]),
    ),
    resources: [
      { id: "yoga", name: "Зала Баланс", capacity: 8 },
      { id: "fitness", name: "Зала Енергия", capacity: 12 },
    ],
  },
];
