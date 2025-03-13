//import GoogleMapsDebugger from '../components/ui-custom/GoogleMapsDebugger'; add this to the page where you needc to bug google maps

/* Add this to the page where you need to bug google maps
<Card className="mb-8">
<CardHeader>
  <CardTitle>API Diagnostics</CardTitle>
  <CardDescription>
    Check if the Google Maps API is correctly configured
  </CardDescription>
</CardHeader>
<CardContent>
  <GoogleMapsDebugger />
</CardContent>
</Card> */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

// Environment variables helper
const getEnvironmentVariables = () => {
  const variables: Record<string, string | undefined> = {};
  
  // Check for common environment variable patterns
  for (const key in import.meta.env) {
    if (key.includes('GOOGLE') || key.includes('MAP') || key.includes('API')) {
      variables[key] = import.meta.env[key];
    }
  }
  
  // Specifically check for the Google Maps API key
  variables['VITE_GOOGLE_MAPS_API_KEY'] = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  return variables;
};

export default function GoogleMapsDebugger() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [autocompleteServiceAvailable, setAutocompleteServiceAvailable] = useState<boolean>(false);
  const [geocoderAvailable, setGeocoderAvailable] = useState<boolean>(false);
  const [envVariables, setEnvVariables] = useState<Record<string, string | undefined>>({});
  
  useEffect(() => {
    // Get environment variables
    setEnvVariables(getEnvironmentVariables());
    
    // Check if Google Maps is already loaded
    checkGoogleMapsStatus();
  }, []);
  
  const checkGoogleMapsStatus = () => {
    setLoading(true);
    setStatus('loading');
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      
      // Check for Places AutocompleteService
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        setAutocompleteServiceAvailable(true);
      } catch (error) {
        console.error('Error checking AutocompleteService:', error);
        setAutocompleteServiceAvailable(false);
      }
      
      // Check for Geocoder
      try {
        const geocoder = new window.google.maps.Geocoder();
        setGeocoderAvailable(true);
      } catch (error) {
        console.error('Error checking Geocoder:', error);
        setGeocoderAvailable(false);
      }
      
      setStatus('success');
    } else {
      setGoogleMapsLoaded(false);
      setStatus('error');
      setErrorMessage('Google Maps API not loaded');
    }
    
    setLoading(false);
  };
  
  const loadGoogleMapsScript = () => {
    setLoading(true);
    setStatus('loading');
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
      setLoading(false);
      return;
    }
    
    // Remove any existing Google Maps scripts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());
    
    // Reset Google Maps global object
    delete window.google;
    
    // Create and append new script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      checkGoogleMapsStatus();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setStatus('error');
      setErrorMessage('Failed to load Google Maps API. Your API key might be invalid or restricted.');
      setLoading(false);
    };
    
    document.head.appendChild(script);
  };
  
  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Google Maps API Debugger
        </CardTitle>
        <CardDescription>
          Check if the Google Maps API is correctly configured
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <span className="font-medium">Status</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>
              {loading ? 'Checking...' : status === 'success' ? 'API Ready' : 'API Error'}
            </span>
          </div>
        </div>
        
        {/* Detailed Status */}
        {!loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <span>Google Maps Loaded</span>
              <span className={googleMapsLoaded ? 'text-green-500' : 'text-red-500'}>
                {googleMapsLoaded ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <span>Autocomplete Service</span>
              <span className={autocompleteServiceAvailable ? 'text-green-500' : 'text-red-500'}>
                {autocompleteServiceAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <span>Geocoder Service</span>
              <span className={geocoderAvailable ? 'text-green-500' : 'text-red-500'}>
                {geocoderAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {/* Environment Variables */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Environment Variables</h3>
          <div className="text-xs bg-muted p-2 rounded-md max-h-24 overflow-y-auto">
            {Object.entries(envVariables).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>
                  {value ? 
                    (key.includes('KEY') ? 
                      `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : 
                      value) 
                    : 'undefined'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={loadGoogleMapsScript} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Reload Google Maps API'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}