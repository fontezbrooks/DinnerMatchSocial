import { CardData } from '../components/SwipeCard';

// Generate realistic test data for performance testing
export const generateTestCards = (count: number = 50): CardData[] => {
  const names = [
    'Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery',
    'Quinn', 'Skyler', 'Reese', 'Cameron', 'Hayden', 'Parker', 'Blake',
    'Jamie', 'Devon', 'Sage', 'River', 'Phoenix', 'Dallas', 'Justice',
    'Emerson', 'Finley', 'Marlowe', 'Peyton', 'Rowan', 'Shiloh', 'True',
    'Winter', 'Kai', 'Lane', 'Oakley', 'Remy', 'Sutton', 'Teagan', 'Wren'
  ];

  const bios = [
    'Love hiking and exploring new trails. Coffee enthusiast and weekend adventurer.',
    'Passionate about cooking and trying new restaurants. Always up for a food adventure!',
    'Fitness lover and yoga instructor. Living life mindfully and staying active.',
    'Artist and creative soul. Love painting, music, and all things beautiful.',
    'Tech enthusiast and startup founder. Building the future one app at a time.',
    'Travel blogger and wanderlust spirit. 30 countries and counting!',
    'Dog lover and veterinarian. My golden retriever is my best friend.',
    'Bookworm and literature teacher. Always have a good book recommendation.',
    'Musician and songwriter. Life is better with a soundtrack.',
    'Photographer capturing life\'s precious moments. Let\'s make memories together.',
    'Chef and foodie. The way to my heart is through good food.',
    'Fitness trainer helping people reach their goals. Sweat together, stay together.',
    'Entrepreneur and innovator. Always working on the next big idea.',
    'Nature lover and environmental activist. Let\'s save the planet together.',
    'Dance instructor and performer. Life\'s too short not to dance!',
    'Graphic designer with an eye for aesthetics. Beauty is in the details.',
    'Software engineer coding a better tomorrow. Logic and creativity combined.',
    'Marine biologist exploring ocean mysteries. The sea calls to me.',
    'Journalist telling stories that matter. Words have power.',
    'Architect designing spaces that inspire. Form meets function.',
  ];

  const imageUrls = Array.from({ length: count }, (_, i) =>
    `https://picsum.photos/400/600?random=${i + 1}&portrait`
  );

  return Array.from({ length: count }, (_, index) => ({
    id: `card_${index}`,
    name: names[index % names.length],
    age: Math.floor(Math.random() * 15) + 22, // Ages 22-36
    image: imageUrls[index],
    bio: bios[index % bios.length],
  }));
};

// Pre-generated test data for consistent performance testing
export const TEST_CARDS = generateTestCards(50);