// Разликите между отделите са в конфигурацията, а не в отделни приложения.
const weekdays = Object.fromEntries(
  [1, 2, 3, 4, 5].map((day) => [day, [[540, 1080]]]),
);
export const businesses = [
  {
    id: "clinic",
    name: "Медицински отдел",
    type: "Здраве",
    icon: "✚",
    mode: "hours",
    description: "Изберете специалист и удобно време за преглед.",
    resourceLabel: "Лекар",
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
      {
        id: "cardiologist",
        name: "Д-р Иван Петров · Кардиолог",
        detail: "Сърце и кръвоносна система",
        capacity: 1,
      },
      {
        id: "dermatologist",
        name: "Д-р Елена Димова · Дерматолог",
        detail: "Кожа и профилактика",
        capacity: 1,
      },
      {
        id: "pediatrician",
        name: "Д-р Мария Стоянова · Педиатър",
        detail: "Грижа за детското здраве",
        capacity: 1,
      },
    ],
  },
  {
    id: "salon",
    name: "Фризьорски отдел",
    type: "Стил",
    icon: "✂",
    mode: "hours",
    description: "Трима специалисти. Вашият час за нова визия.",
    resourceLabel: "Фризьор",
    step: 30,
    durations: [30, 60, 90],
    hours: { ...weekdays, 6: [[600, 960]] },
    resources: [
      {
        id: "maria",
        name: "Мария Николова",
        detail: "Подстригване и оформяне",
        capacity: 1,
      },
      {
        id: "elena",
        name: "Елена Тодорова",
        detail: "Боядисване и стилизиране",
        capacity: 1,
      },
      {
        id: "georgi",
        name: "Георги Димитров",
        detail: "Мъжко подстригване и брада",
        capacity: 1,
      },
    ],
  },
  {
    id: "hotels",
    name: "Хотелски отдел",
    type: "Почивка",
    icon: "⌂",
    mode: "nights",
    description: "Градски уикенд, SPA почивка или бягство в планината.",
    resourceLabel: "Хотел",
    resources: [
      {
        id: "city",
        name: "Хотел Централ · Градски",
        detail: "В сърцето на града · София",
        capacity: 12,
        roomTypes: [
          { id: "single", name: "Единична", capacity: 2 },
          { id: "double", name: "Двойна", capacity: 5 },
          { id: "studio", name: "Студио", capacity: 3 },
          { id: "apartment", name: "Апартамент", capacity: 2 },
        ],
      },
      {
        id: "spa",
        name: "Хотел Хармония · SPA",
        detail: "Минерални басейни · Велинград",
        capacity: 8,
        roomTypes: [
          { id: "single", name: "Единична", capacity: 1 },
          { id: "double", name: "Двойна", capacity: 2 },
          { id: "studio", name: "Студио", capacity: 3 },
          { id: "apartment", name: "Апартамент", capacity: 2 },
        ],
      },
      {
        id: "mountain",
        name: "Хотел Бор · Планински",
        detail: "Природа и спокойствие · Банско",
        capacity: 6,
        roomTypes: [
          { id: "single", name: "Единична", capacity: 1 },
          { id: "double", name: "Двойна", capacity: 3 },
          { id: "studio", name: "Студио", capacity: 1 },
          { id: "apartment", name: "Апартамент", capacity: 1 },
        ],
      },
    ],
  },
];
