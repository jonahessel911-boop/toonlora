/** Full genre catalog for admin publishing and browse surfaces. */
export const PLATFORM_GENRE_GROUPS = [
  {
    label: "Popular",
    genres: [
      "Romance",
      "Fantasy",
      "Anime",
      "Comedy",
      "Drama",
      "Action",
      "Thriller",
      "Horror",
    ],
  },
  {
    label: "Lifestyle",
    genres: [
      "Slice of Life",
      "School",
      "Office",
      "Sports",
      "Music",
      "Cooking",
      "Travel",
    ],
  },
  {
    label: "Fiction & history",
    genres: [
      "Adventure",
      "Sci-Fi",
      "Mystery",
      "Historical",
      "History",
      "Business",
      "War",
      "Western",
      "Biography",
    ],
  },
  {
    label: "Mature",
    genres: ["18+", "Mature", "Dark Romance", "Spicy", "Psychological"],
  },
] as const;

export const PLATFORM_GENRES: string[] = PLATFORM_GENRE_GROUPS.flatMap(
  (group) => [...group.genres]
);

export const DEFAULT_PLATFORM_GENRE = "Fantasy";
