// Демо самоличности за представяне. Това не е система за сигурно влизане.
export const profiles = [
  {
    id: "alex",
    name: "Алекс Иванов",
    email: "alex@example.com",
    role: "customer",
  },
  {
    id: "elitsa",
    name: "Елица Петрова",
    email: "elitsa@example.com",
    role: "customer",
  },
  {
    id: "boris",
    name: "Борис Георгиев",
    email: "boris@example.com",
    role: "customer",
  },
  {
    id: "admin",
    name: "Администратор",
    email: "admin@example.com",
    role: "admin",
  },
];
export const customers = profiles.filter(
  (profile) => profile.role === "customer",
);
