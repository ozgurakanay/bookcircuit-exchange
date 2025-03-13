// src/lib/googleMapsLoader.ts

/**
 * A dedicated module for loading and managing the Google Maps API
 */
let isLoading = false;
let isLoaded = false;
let loadError: string | null = null;
let callbacks: Array<(success: boolean, error?: string) => void> = [];

/**
 * Load the Google Maps API with a callback pattern
 */
export function loadGoogleMapsAPI(
  apiKey: string,
  callback: (success: boolean, error?: string) => void
) {
  // If already loaded, call back immediately
  if (isLoaded && window.google && window.google.maps) {
    callback(true);
    return;
  }

  // If already loading, queue the callback
  if (isLoading) {
    callbacks.push(callback);
    return;
  }

  // If previous load failed, report the error
  if (loadError) {
    callback(false, loadError);
    return;
  }

  // Start loading
  isLoading = true;
  callbacks.push(callback);

  // Create a unique callback name
  const callbackName = `googleMapsCallback_${Date.now()}`;
  
  // Set up the callback function
  (window as any)[callbackName] = () => {
    console.log('Google Maps API loaded successfully');
    isLoading = false;
    isLoaded = true;
    loadError = null;
    
    // Notify all waiting callbacks
    callbacks.forEach(cb => cb(true));
    callbacks = [];
    
    // Clean up the global callback
    delete (window as any)[callbackName];
  };

  // Create and add the script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
  script.async = true;
  script.defer = true;
  
  // Handle loading errors
  script.onerror = () => {
    console.error('Failed to load Google Maps API script');
    isLoading = false;
    loadError = 'Failed to load Google Maps API';
    
    // Notify all waiting callbacks of the failure
    callbacks.forEach(cb => cb(false, loadError));
    callbacks = [];
    
    // Clean up the global callback
    delete (window as any)[callbackName];
  };
  
  // Set a timeout in case the callback is never triggered
  setTimeout(() => {
    if ((window as any)[callbackName]) {
      console.error('Google Maps API loading timed out');
      isLoading = false;
      loadError = 'Google Maps API loading timed out';
      
      // Notify all waiting callbacks of the timeout
      callbacks.forEach(cb => cb(false, loadError));
      callbacks = [];
      
      // Clean up the global callback
      delete (window as any)[callbackName];
    }
  }, 10000); // 10 second timeout
  
  // Add the script to the document
  document.head.appendChild(script);
}