import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { searchBooksByParams, verifyDatabaseAccess } from '@/lib/bookService';
import { Book } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const TestGeography = () => {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookDistances, setBookDistances] = useState<Record<string, number>>({});
  const [latitude, setLatitude] = useState<number>(37.7749); // San Francisco
  const [longitude, setLongitude] = useState<number>(-122.4194); // San Francisco
  const [radius, setRadius] = useState<number>(1); // 1km
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  
  // Verify session on component mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log("TestGeography: Beginning session verification");
        setLoading(true);
        
        // Use our dedicated verification function that covers both auth and geography
        const result = await verifyDatabaseAccess();
        
        if (!result.success) {
          console.error("Database verification failed:", result.message);
          setError(result.message);
        } else {
          console.log("Database verification successful:", result.message);
          
          // Explicitly refresh the user profile to ensure auth context is up-to-date
          await refreshProfile();
          
          // Extra verification - make sure we can access DB directly
          const { error: dbError } = await supabase
            .from('profiles')
            .select('count')
            .single();
          
          if (dbError) {
            console.error("Direct database access failed:", dbError);
            setError("Database access failed. Please return to Dashboard and try again.");
            return;
          }
          
          setSessionChecked(true);
        }
      } catch (err) {
        console.error("Exception during database verification:", err);
        setError("Error checking your session. Please return to Dashboard.");
      } finally {
        setLoading(false);
      }
    };
    
    verifySession();
    
    // Cleanup on unmount
    return () => {
      console.log("TestGeography component unmounting - cleaning up state");
    };
  }, [refreshProfile]);
  
  // If user isn't loaded properly, redirect to Dashboard
  useEffect(() => {
    if (!user && sessionChecked) {
      console.log("No user found in TestGeography, redirecting to Dashboard");
      safeNavigate();
    }
  }, [user, sessionChecked]);
  
  // Function to calculate distance between two points using Haversine formula (client-side)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  const safeNavigate = () => {
    // Use React Router navigation, but ensure we're not preserving any problematic state
    // by navigating with replace: true, which replaces the current entry in the history stack
    navigate('/dashboard', { replace: true });
  };

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      // First verify session is still valid
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        throw new Error("Your session appears to be invalid. Please sign in again.");
      }
      
      const result = await TestGeography();
      setResults(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Test error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      // First verify session is still valid
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        throw new Error("Your session appears to be invalid. Please sign in again.");
      }
      
      const searchResults = await searchBooksByParams({
        latitude,
        longitude,
        radius
      });
      
      // Calculate distances client-side as a verification
      const distances: Record<string, number> = {};
      // Filter books to only show those within the radius (client-side verification)
      const filteredResults = searchResults.filter(book => {
        if (book.lat && book.lng) {
          const distance = calculateDistance(latitude, longitude, book.lat, book.lng);
          distances[book.id] = distance;
          return distance <= radius;
        }
        return false;
      });
      
      setBooks(filteredResults);
      setBookDistances(distances);
      
      if (filteredResults.length !== searchResults.length) {
        setResults(`Found ${filteredResults.length} books within ${radius}km radius (${searchResults.length} returned by database function)`);
      } else {
        setResults(`Found ${filteredResults.length} books within ${radius}km radius`);
      }
      
      // Extra debug: Let's call the raw Postgres function
      try {
        const { data: spatialData, error: spatialError } = await supabase.rpc(
          'get_books_with_distances',
          {
            lat: latitude,
            lng: longitude,
            max_distance_km: radius
          }
        );
        
        if (spatialError) {
          console.error('Error calling get_books_with_distances:', spatialError);
          setResults(prevResults => prevResults + '\n\nError with spatial function: ' + spatialError.message);
        } else {
          console.log('Raw distance data from database:', spatialData);
          setResults(prevResults => prevResults + '\n\nRaw distance data: ' + JSON.stringify(spatialData, null, 2));
        }
      } catch (spatialError) {
        console.error('Exception calling spatial function:', spatialError);
        setResults(prevResults => prevResults + '\n\nCritical error with spatial function');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to test known locations
  const usePresetLocation = (label: string, lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setResults(`Set location to ${label}: ${lat}, ${lng}`);
  };

  // If we have an error, show a simplified UI
  if (error && !sessionChecked) {
    return (
      <div className="container py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button 
                onClick={safeNavigate}
                className="mr-2"
              >
                Return to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Button 
          onClick={safeNavigate} 
          variant="ghost" 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Geography Function Test</h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={safeNavigate}
              >
                Return to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Geography Function</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} disabled={loading}>
            {loading ? 'Testing...' : 'Run PostGIS Function Test'}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Preset Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={() => usePresetLocation('San Francisco', 37.7749, -122.4194)}
            variant="outline"
            className="mr-2"
          >
            San Francisco
          </Button>
          <Button 
            onClick={() => usePresetLocation('New York', 40.7128, -74.0060)}
            variant="outline"
            className="mr-2"
          >
            New York
          </Button>
          <Button 
            onClick={() => usePresetLocation('Istanbul', 41.0082, 28.9784)}
            variant="outline"
            className="mr-2"
          >
            Istanbul
          </Button>
          <Button 
            onClick={() => usePresetLocation('London', 51.5074, -0.1278)}
            variant="outline"
          >
            London
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Search by Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <Input 
                type="number" 
                value={latitude} 
                onChange={(e) => setLatitude(parseFloat(e.target.value))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <Input 
                type="number" 
                value={longitude} 
                onChange={(e) => setLongitude(parseFloat(e.target.value))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Radius (km)</label>
              <Input 
                type="number" 
                value={radius} 
                min={1}
                max={20000} 
                onChange={(e) => setRadius(parseFloat(e.target.value))} 
              />
            </div>
          </div>
          
          <Button onClick={searchBooks} disabled={loading}>
            {loading ? 'Searching...' : 'Search Books'}
          </Button>
        </CardContent>
      </Card>
      
      {results && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {results}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {books.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Found Books (Within {radius}km radius)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {books.map((book) => (
                <div key={book.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  <p className="text-sm">{book.location_text}</p>
                  {book.lat && book.lng && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Book Location: {book.lat.toFixed(6)}, {book.lng.toFixed(6)}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        Distance: {bookDistances[book.id]?.toFixed(2) || 'Unknown'} km {bookDistances[book.id] && bookDistances[book.id] <= radius ? '✓' : '✗'}
                      </p>
                      <p className="text-sm">
                        Coordinate distance from search point: {
                          Math.sqrt(
                            Math.pow(book.lat - latitude, 2) + 
                            Math.pow(book.lng - longitude, 2)
                          ).toFixed(6)
                        }° (decimal degrees)
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestGeography; 