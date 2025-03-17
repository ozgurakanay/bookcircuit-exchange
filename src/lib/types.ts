// Database types for TypeScript
export type Profile = {
  id: string;
  full_name?: string;
  bio?: string;
  location?: string;
  favorite_genre?: string;
  website?: string;
  avatar_url?: string;
  email?: string;
  created_at: string;
  updated_at: string;
};

export type BookCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author?: string;
  location_text: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  condition: BookCondition;
  cover_img_url?: string;
  isbn?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Optional distance fields for geographic searches
  distance_meters?: number;
  distance_km?: number;
};

// Blog post type
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image_url?: string;
  author: string;
  author_id?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
};

// Location data types
export type LocationData = {
  postalCode: string;
  formattedAddress: string;
  lat?: number;
  lng?: number;
};

// API response types for Open Library API
export type OpenLibraryBook = {
  key?: string;
  title: string;
  authors?: { name: string }[];
  author_name?: string[];
  covers?: number[];
  cover_i?: number;
  isbn_13?: string[];
  isbn_10?: string[];
  isbn?: string[];
  description?: string | { value: string };
  publish_date?: string;
};

export type OpenLibraryResponse = {
  numFound: number;
  start: number;
  docs: OpenLibraryBook[];
}; 