export type GeographyTask = {
  id: string;
  capital: string;
  choices: string[];
  correctAnswer: string;
};

export const geographyTasks: GeographyTask[] = [
  {
    id: "geo-1",
    capital: "Berlin",
    choices: [
      "Germany",
      "Austria",
      "Switzerland",
    ],
    correctAnswer: "Germany",
  },

  {
    id: "geo-2",
    capital: "Madrid",
    choices: [
      "Spain",
      "Portugal",
      "Italy",
    ],
    correctAnswer: "Spain",
  },

  {
    id: "geo-3",
    capital: "Rome",
    choices: [
      "Italy",
      "Greece",
      "France",
    ],
    correctAnswer: "Italy",
  },

  {
    id: "geo-4",
    capital: "Paris",
    choices: [
      "France",
      "Belgium",
      "Netherlands",
    ],
    correctAnswer: "France",
  },

  {
    id: "geo-5",
    capital: "Lisbon",
    choices: [
      "Portugal",
      "Spain",
      "Brazil",
    ],
    correctAnswer: "Portugal",
  },

  {
    id: "geo-6",
    capital: "Tokyo",
    choices: [
      "Japan",
      "China",
      "South Korea",
    ],
    correctAnswer: "Japan",
  },

  {
    id: "geo-7",
    capital: "Ottawa",
    choices: [
      "Canada",
      "United States",
      "Australia",
    ],
    correctAnswer: "Canada",
  },

  {
    id: "geo-8",
    capital: "Canberra",
    choices: [
      "Australia",
      "New Zealand",
      "Canada",
    ],
    correctAnswer: "Australia",
  },

  {
    id: "geo-9",
    capital: "Cairo",
    choices: [
      "Egypt",
      "Morocco",
      "Jordan",
    ],
    correctAnswer: "Egypt",
  },

  {
    id: "geo-10",
    capital: "Buenos Aires",
    choices: [
      "Argentina",
      "Chile",
      "Uruguay",
    ],
    correctAnswer: "Argentina",
  },
];