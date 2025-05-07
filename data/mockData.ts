import type {
  Room,
  Console,
  SpecificRoom,
  FoodDrink,
  Game,
} from "@/types/types";

// Mock data for rooms
export const roomsData: Room[] = [
  {
    id: 1,
    category: "Regular",
    price: 0,
    description:
      "Standard gaming setup with comfortable seating and great audio.",
    image: "/images/rooms/reguler.png",
  },
  {
    id: 2,
    category: "VIP",
    price: 5000,
    description: "Premium setup with larger screen and enhanced sound system.",
    image: "/images/rooms/vip.png",
  },
  {
    id: 3,
    category: "VVIP",
    price: 10000,
    description:
      "Luxury gaming experience with the best equipment and private space.",
    image: "/images/rooms/vvip.png",
  },
];

// Mock data for consoles
export const consolesData: Console[] = [
  {
    id: 1,
    name: "PlayStation 3",
    price: 5000,
    description: "Classic gaming experience with a wide library of games.",
    image: "/images/console/ps3.png",
  },
  {
    id: 2,
    name: "PlayStation 4",
    price: 7000,
    description: "High-definition gaming with free Netflix access included.",
    image: "/images/console/ps4.png",
  },
  {
    id: 3,
    name: "PlayStation 5",
    price: 10000,
    description:
      "Next-gen gaming with ultra-fast loading and stunning graphics.",
    image: "/images/console/ps5.png",
  },
];

// Mock data for specific rooms
export const specificRoomsData: SpecificRoom[] = [
  { id: 1, name: "Unit A", type: "Regular", available: true },
  { id: 2, name: "Unit B", type: "Regular", available: true },
  { id: 3, name: "Unit C", type: "Regular", available: false },
  { id: 4, name: "Unit D", type: "VIP", available: true },
  { id: 5, name: "Unit E", type: "VIP", available: false },
  { id: 6, name: "Unit F", type: "VVIP", available: true },
];

// Mock data for food and drinks
export const foodAndDrinksData: FoodDrink[] = [
  {
    id: 1,
    name: "Chicken Rice Bowl",
    price: 10000,
    description: "Spicy rice bowl with chicken",
    image: "/images/food/beef.jpg",
    category: "Ricebowl",
  },
  {
    id: 2,
    name: "Beef Rice Bowl",
    price: 12000,
    description: "Rice bowl with beef",
    image: "/images/food/chicken.jpg",
    category: "Ricebowl",
  },
  {
    id: 3,
    name: "Vegetable Noodles",
    price: 8000,
    description: "Noodles with vegetables",
    image: "/images/food/noodle1.jpg",
    category: "Noodles",
  },
  {
    id: 4,
    name: "Beef Noodles",
    price: 10000,
    description: "Noodles with beef",
    image: "/images/food/noodle2.jpg",
    category: "Noodles",
    soldOut: true,
  },
  {
    id: 5,
    name: "Potato Chips",
    price: 5000,
    description: "Crispy potato chips",
    image: "/images/food/potcips.jpg",
    category: "Snacks",
  },
  {
    id: 6,
    name: "Popcorn",
    price: 5000,
    description: "Buttered popcorn",
    image: "/images/food/popcorn.jpg",
    category: "Snacks",
  },
  {
    id: 7,
    name: "Mineral Water",
    price: 3000,
    description: "Bottled mineral water",
    image: "/images/food/mineral.jpg",
    category: "Drinks",
  },
  {
    id: 8,
    name: "Soda",
    price: 5000,
    description: "Carbonated soft drink",
    image: "/images/food/soda.jpg",
    category: "Drinks",
  },
];

export const gamesData: Game[] = [
  {
    id: 1,
    name: "FIFA 22",
    unit: "Unit A", // Referencing the PS unit where the game is available
    available: true,
    image: "/images/games/1.png",
    description:
      "The most realistic soccer game with amazing graphics and mechanics.",
  },
  {
    id: 2,
    name: "Call of Duty: Warzone",
    unit: "Unit A",
    available: true,
    image: "/images/games/2.png",
    description: "Battle royale action with high-intensity combat.",
  },
  {
    id: 3,
    name: "Minecraft",
    unit: "Unit B", // Available in a different unit
    available: true,
    image: "/images/games/3.png",
    description: "Build, explore, and survive in a sandbox world.",
  },
  {
    id: 4,
    name: "Gran Turismo 7",
    unit: "Unit B",
    available: false, // Not available in this unit
    image: "/images/games/4.png",
    description:
      "The ultimate driving simulation game with real-world tracks and cars.",
  },
  {
    id: 5,
    name: "Assassin's Creed Valhalla",
    unit: "Unit C", // Available in a different unit
    available: true,
    image: "/images/games/5.png",
    description:
      "Viking-era action-adventure game with open-world exploration.",
  },
  {
    id: 6,
    name: "Spider-Man: Miles Morales",
    unit: "Unit C",
    available: true,
    image: "/images/games/6.png",
    description:
      "Experience the adventures of Miles Morales as the new Spider-Man.",
  },
  {
    id: 7,
    name: "The Last of Us Part II",
    unit: "Unit F", // Available in a different unit
    available: true,
    image: "/images/games/7.png",
    description:
      "Emotionally charged action game following Ellie in a post-apocalyptic world.",
  },
  {
    id: 8,
    name: "Cyberpunk 2077",
    unit: "Unit F",
    available: false, // Not available in this unit
    image: "/images/games/8.png",
    description:
      "Open-world RPG set in a dystopian cyberpunk future with deep storytelling.",
  },
  {
    id: 9,
    name: "Cyberpunk 2077",
    unit: "Unit D",
    available: true, // Not available in this unit
    image: "/images/games/9.png",
    description:
      "Open-world RPG set in a dystopian cyberpunk future with deep storytelling.",
  },
  {
    id: 10,
    name: "Cyberpunk 2077",
    unit: "Unit E",
    available: true, // Not available in this unit
    image: "/images/games/10.png",
    description:
      "Open-world RPG set in a dystopian cyberpunk future with deep storytelling.",
  },
  {
    id: 11,
    name: "Cyberpunk 2077",
    unit: "Unit C",
    available: true, // Not available in this unit
    image: "/images/games/11.png",
    description:
      "Open-world RPG set in a dystopian cyberpunk future with deep storytelling.",
  },
  {
    id: 12,
    name: "Call of Duty: Warzone",
    unit: "Unit A",
    available: true,
    image: "/images/games/12.png",
    description: "Battle royale action with high-intensity combat.",
  },
];
