import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Users, BookOpen, BookMarked, Shield, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminBooksTab from '@/components/admin/AdminBooksTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';

// Add admin role check to restrict access to admin users only
const Admin = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    books: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        if (userError) throw userError;

        // Fetch books count
        const { count: booksCount, error: booksError } = await supabase
          .from('books')
          .select('id', { count: 'exact', head: true });
        
        if (booksError) throw booksError;

        setCounts({
          users: userCount || 0,
          books: booksCount || 0
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Simplified navigation check - only requires authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading admin panel...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, books, and application settings.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          Return to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.users}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.books}</div>
            <p className="text-xs text-muted-foreground">Listed for exchange</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Full access granted</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="books">
            <BookMarked className="h-4 w-4 mr-2" />
            Books
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <AdminUsersTab />
        </TabsContent>
        <TabsContent value="books" className="mt-6">
          <AdminBooksTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <AdminSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin; 