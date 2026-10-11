export type GeographyTask = {
  id: string;
  capital: string;
  choices: string[];
  correctAnswer: string;
};

type CapitalEntry = {
  capital: string;
  country: string;
};

const capitalPool: CapitalEntry[] = [
  {
    capital: "Berlin",
    country: "Germany",
  },
  {
    capital: "Madrid",
    country: "Spain",
  },
  {
    capital: "Rome",
    country: "Italy",
  },
  {
    capital: "Paris",
    country: "France",
  },
  {
    capital: "Lisbon",
    country: "Portugal",
  },
  {
    capital: "Tokyo",
    country: "Japan",
  },
  {
    capital: "Ottawa",
    country: "Canada",
  },
  {
    capital: "Canberra",
    country: "Australia",
  },
  {
    capital: "Cairo",
    country: "Egypt",
  },
  {
    capital: "Buenos Aires",
    country: "Argentina",
  },
  {
    capital: "Athens",
    country: "Greece",
  },
  {
    capital: "Vienna",
    country: "Austria",
  },
  {
    capital: "Brussels",
    country: "Belgium",
  },
  {
    capital: "Amsterdam",
    country: "Netherlands",
  },
  {
    capital: "Oslo",
    country: "Norway",
  },
  {
    capital: "Stockholm",
    country: "Sweden",
  },
  {
    capital: "Helsinki",
    country: "Finland",
  },
  {
    capital: "Copenhagen",
    country: "Denmark",
  },
  {
    capital: "Warsaw",
    country: "Poland",
  },
  {
    capital: "Prague",
    country: "Czech Republic",
  },
  {
    capital: "Dublin",
    country: "Ireland",
  },
  {
    capital: "Bern",
    country: "Switzerland",
  },
  {
    capital: "Ankara",
    country: "Turkey",
  },
  {
    capital: "Rabat",
    country: "Morocco",
  },
  {
    capital: "Seoul",
    country: "South Korea",
  },
  {
    capital: "Beijing",
    country: "China",
  },
  {
    capital: "New Delhi",
    country: "India",
  },
  {
    capital: "Brasilia",
    country: "Brazil",
  },
  {
    capital: "Mexico City",
    country: "Mexico",
  },
  {
    capital: "Wellington",
    country: "New Zealand",
  },
];

function shuffleArray<T>(
  array: T[]
): T[] {
  const shuffled = [...array];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    const current = shuffled[i];
    const random = shuffled[j];

    if (
      current === undefined ||
      random === undefined
    ) {
      continue;
    }

    shuffled[i] = random;
    shuffled[j] = current;
  }

  return shuffled;
}

function createChoices(
  correctCountry: string
): string[] {
  const wrongCountries =
    capitalPool
      .filter(
        (entry) =>
          entry.country !==
          correctCountry
      )
      .map(
        (entry) => entry.country
      );

  const shuffledWrongCountries =
    shuffleArray(wrongCountries);

  const firstWrong =
    shuffledWrongCountries[0];

  const secondWrong =
    shuffledWrongCountries[1];

  if (
    firstWrong === undefined ||
    secondWrong === undefined
  ) {
    throw new Error(
      "Not enough Geography distractors"
    );
  }

  return shuffleArray([
    correctCountry,
    firstWrong,
    secondWrong,
  ]);
}

export function generateGeographyTasks():
  GeographyTask[] {
  const selectedCapitals =
    shuffleArray(
      capitalPool
    ).slice(0, 10);

  return selectedCapitals.map(
    (entry, index) => ({
      id: `geo-${index + 1}`,

      capital: entry.capital,

      choices: createChoices(
        entry.country
      ),

      correctAnswer:
        entry.country,
    })
  );
}