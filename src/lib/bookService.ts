import { OpenLibraryBook, OpenLibraryResponse, Book, BookCondition } from './types';
import { supabase, verifySessionWithServer, verifyDatabaseAccess as supabaseVerifyAccess } from './supabase';

// Base URL for Open Library API
const OPEN_LIBRARY_API_URL = 'https://openlibrary.org';

// Search for books by title, author, or ISBN
export const searchBooks = async (query: string): Promise<OpenLibraryBook[]> => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_API_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching book data: ${response.statusText}`);
    }
    
    const data: OpenLibraryResponse = await response.json();
    
    // Enhance the search results with additional data where possible
    const enhancedResults = await Promise.all(
      data.docs.map(async (book) => {
        // If we have a work key, try to fetch additional details
        if (book.key && book.key.startsWith('/works/')) {
          try {
            const workResponse = await fetch(`${OPEN_LIBRARY_API_URL}${book.key}.json`);
            if (workResponse.ok) {
              const workData = await workResponse.json();
              // Merge the work data with the search result
              return {
                ...book,
                description: workData.description || book.description,
                covers: workData.covers || book.covers
              };
            }
          } catch (error) {
            console.error('Error fetching additional book details:', error);
          }
        }
        return book;
      })
    );
    
    return enhancedResults;
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

// Get book cover image URL from Open Library
export const getBookCoverUrl = (coverId: number, size: 'S' | 'M' | 'L' = 'M'): string => {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

// Format book data from Open Library for our database
export const formatBookData = (bookData: OpenLibraryBook): Partial<Book> => {
  // Process description field which can be a string or an object
  let description = '';
  
  if (typeof bookData.description === 'string') {
    description = bookData.description;
  } else if (bookData.description && typeof bookData.description === 'object' && 'value' in bookData.description) {
    description = bookData.description.value;
  }
  
  // Get author from either the authors array or author_name array
  let author = '';
  if (bookData.authors && bookData.authors.length > 0 && bookData.authors[0].name) {
    author = bookData.authors[0].name;
  } else if (bookData.author_name && bookData.author_name.length > 0) {
    author = bookData.author_name[0];
  }
  
  // Get ISBN from various possible fields
  let isbn = '';
  if (bookData.isbn_13 && bookData.isbn_13.length > 0) {
    isbn = bookData.isbn_13[0];
  } else if (bookData.isbn_10 && bookData.isbn_10.length > 0) {
    isbn = bookData.isbn_10[0];
  } else if (bookData.isbn && bookData.isbn.length > 0) {
    isbn = bookData.isbn[0];
  }
  
  // Get cover image URL if a cover ID is available
  let coverImgUrl = undefined;
  if (bookData.covers && bookData.covers.length > 0) {
    coverImgUrl = getBookCoverUrl(bookData.covers[0]);
  } else if (bookData.cover_i) {
    // Some search results use cover_i instead of covers array
    coverImgUrl = getBookCoverUrl(bookData.cover_i);
  }
  
  return {
    title: bookData.title,
    author,
    isbn,
    description,
    cover_img_url: coverImgUrl,
  };
};

// Add a new book to the database
export const addBook = async (
  userId: string,
  bookData: {
    title: string;
    author?: string;
    location_text: string;
    condition: BookCondition;
    cover_img_url?: string;
    isbn?: string;
    description?: string;
    postal_code?: string;
    lat?: number;
    lng?: number;
  }
): Promise<{ success: boolean; error?: string; book?: Book }> => {
  try {
    // Validate and process data before insert
    let processedData = {
      user_id: userId,
      ...bookData,
    };
    
    // Check if cover_img_url is a data URL and too large
    if (processedData.cover_img_url && processedData.cover_img_url.startsWith('data:')) {
      // If it's longer than 500KB (rough estimate for 1MB in DB), use a placeholder instead
      if (processedData.cover_img_url.length > 500000) {
        console.warn('Cover image too large for DB, replacing with placeholder');
        processedData.cover_img_url = 'https://via.placeholder.com/300x400?text=Book+Cover';
      }
    }
    
    // Note: location geography column will be automatically generated by the trigger
    // based on lat/lng values
    
    const { data, error } = await supabase
      .from('books')
      .insert(processedData)
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, book: data as Book };
  } catch (error) {
    console.error('Error adding book:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Get all books for a user
export const getUserBooks = async (userId: string): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as Book[];
  } catch (error) {
    console.error('Error getting user books:', error);
    return [];
  }
};

// Get all books (with optional limit)
export const getAllBooks = async (limit?: number): Promise<Book[]> => {
  try {
    let query = supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    return data as Book[];
  } catch (error) {
    console.error('Error getting all books:', error);
    return [];
  }
};

// Get a book by ID
export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
      
    if (error) throw error;
    
    return data as Book;
  } catch (error) {
    console.error('Error getting book by ID:', error);
    return null;
  }
};

// Delete a book
export const deleteBook = async (bookId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Update an existing book
export const updateBook = async (
  bookId: string,
  bookData: {
    title: string;
    author?: string;
    location_text: string;
    condition: BookCondition;
    cover_img_url?: string;
    isbn?: string;
    description?: string;
    postal_code?: string;
    lat?: number;
    lng?: number;
  }
): Promise<{ success: boolean; error?: string; book?: Book }> => {
  try {
    // Validate and process data before update
    let processedData = {
      ...bookData,
    };
    
    // Check if cover_img_url is a data URL and too large
    if (processedData.cover_img_url && processedData.cover_img_url.startsWith('data:')) {
      // If it's longer than 500KB (rough estimate for 1MB in DB), use a placeholder instead
      if (processedData.cover_img_url.length > 500000) {
        console.warn('Cover image too large for DB, replacing with placeholder');
        processedData.cover_img_url = 'https://via.placeholder.com/300x400?text=Book+Cover';
      }
    }
    
    // Note: location geography column will be automatically updated by the trigger
    // based on lat/lng values
    
    const { data, error } = await supabase
      .from('books')
      .update(processedData)
      .eq('id', bookId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, book: data as Book };
  } catch (error) {
    console.error('Error updating book:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Get recently added books
export const getRecentlyAddedBooks = async (limit: number = 8): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recently added books:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching recently added books:', error);
    return [];
  }
};

// Search books by location parameters
export const searchBooksByParams = async ({ 
  latitude, 
  longitude, 
  radius = 5, // Default 5km radius
  limit = 20 
}: { 
  latitude: number, 
  longitude: number, 
  radius?: number, 
  limit?: number 
}): Promise<Book[]> => {
  try {
    // Verify database access before proceeding
    const dbAccessCheck = await verifyDatabaseAccess();
    if (!dbAccessCheck.success) {
      throw new Error(dbAccessCheck.message);
    }
    
    // Call the stored procedure to find nearby books
    const { data, error } = await supabase.rpc(
      'get_books_with_distances',
      {
        lat: latitude,
        lng: longitude,
        max_distance_km: radius,
        max_results: limit
      }
    );
    
    if (error) {
      console.error('Error searching books by location:', error);
      throw error;
    }
    
    return data as Book[];
  } catch (error) {
    console.error('Exception in searchBooksByParams:', error);
    throw error;
  }
};

// Request a book
export const requestBook = async (
  bookId: string, 
  requesterId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, check if the book exists
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('user_id')
      .eq('id', bookId)
      .single();
    
    if (bookError || !book) {
      return { success: false, error: 'Book not found' };
    }
    
    // Don't allow requesting your own book
    if (book.user_id === requesterId) {
      return { success: false, error: 'You cannot request your own book' };
    }
    
    // Check if a request already exists
    const { data: existingRequest, error: existingRequestError } = await supabase
      .from('book_requests')
      .select('*')
      .eq('book_id', bookId)
      .eq('requester_id', requesterId)
      .single();
      
    if (existingRequest) {
      return { success: false, error: 'You have already requested this book' };
    }
    
    // Create the request
    const { error: requestError } = await supabase
      .from('book_requests')
      .insert([
        {
          book_id: bookId,
          requester_id: requesterId,
          owner_id: book.user_id,
          status: 'pending'
        }
      ]);
      
    if (requestError) {
      return { success: false, error: requestError.message };
    }
    
    // Create a notification for the book owner
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: book.user_id,
          type: 'book_request',
          message: `Someone has requested your book`,
          related_id: bookId,
          read: false
        }
      ]);
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // We'll consider the request successful even if notification fails
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting book:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get requested books for a user
export const getUserRequestedBooks = async (userId: string): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('book_requests')
      .select(`
        books:book_id(*)
      `)
      .eq('requester_id', userId);
    
    if (error) {
      console.error('Error fetching requested books:', error);
      return [];
    }
    
    // Transform the data to get the books
    const books = data?.map(item => item.books as unknown as Book) || [];
    return books;
  } catch (error) {
    console.error('Error fetching requested books:', error);
    return [];
  }
};

// Function to verify database access and initialize geography
export const verifyDatabaseAccess = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Use our simplified supabase database verification utility
    const result = await supabaseVerifyAccess();
    
    if (!result.success) {
      return { 
        success: false, 
        message: result.message || 'Database verification failed'
      };
    }
    
    // Verify PostGIS capability specifically
    try {
      // Try a basic geographic query without requiring actual data
      const { error: geoError } = await supabase.rpc('books_within_distance', {
        lat: 0,
        lng: 0,
        distance_meters: 1
      });
      
      // We expect a not-found error but not a function/syntax error
      if (geoError && (
          geoError.message.includes('function') || 
          geoError.message.includes('syntax') || 
          geoError.message.includes('permission')
      )) {
        console.error('PostGIS function error during verification:', geoError);
        return { 
          success: false, 
          message: 'Geographic function error: ' + geoError.message 
        };
      }
      
      return { 
        success: true, 
        message: 'Database access and geographic functions verified.' 
      };
    } catch (geoError) {
      console.error('Exception during PostGIS verification:', geoError);
      return { 
        success: false, 
        message: 'Geographic function exception: ' + (geoError instanceof Error ? geoError.message : String(geoError))
      };
    }
  } catch (error) {
    console.error('Error verifying database access:', error);
    return { 
      success: false, 
      message: 'Verification error: ' + (error instanceof Error ? error.message : 'Unknown error occurred') 
    };
  }
}; 