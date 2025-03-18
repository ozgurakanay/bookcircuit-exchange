import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/lib/types';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Extend Profile type to include email from auth
interface UserWithEmail extends Profile {
  email?: string;
}

interface AuthUser {
  id: string;
  email: string;
}

const Admin = () => {
  const { user, isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all users with their emails
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Create a map for emails from auth.users
      const emailMap = new Map<string, string>();
      
      // Get emails directly from auth.users via RPC function
      try {
        // We need to create this RPC function in our database
        const { data: emailData, error: emailError } = await supabase
          .rpc('get_auth_user_emails');
        
        if (!emailError && emailData && Array.isArray(emailData)) {
          emailData.forEach((item: AuthUser) => {
            if (item && item.id && item.email) {
              emailMap.set(item.id, item.email);
            }
          });
        } else {
          console.error('Error fetching emails:', emailError);
          
          // If RPC fails, use current user's email as fallback for their own profile
          if (user && user.email) {
            emailMap.set(user.id, user.email);
          }
        }
      } catch (error) {
        console.error('Error calling RPC function:', error);
      }
      
      // Combine profile data with email data
      const enhancedProfiles = profilesData.map(profile => {
        // Get email from auth user map or fallback
        const email = emailMap.get(profile.id) || 'Unknown';
        
        return {
          ...profile,
          email
        };
      });
      
      setUsers(enhancedProfiles);
      
      // Log the results for debugging
      console.log('Profiles loaded:', profilesData.length);
      console.log('Emails mapped:', emailMap.size);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load users: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle user role update
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      }));

      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  // Send invitation email
  const sendInvitation = async () => {
    try {
      if (!inviteEmail) {
        toast({
          title: 'Error',
          description: 'Please enter an email address',
          variant: 'destructive'
        });
        return;
      }

      // In a real implementation, you would integrate with an email service
      // or use Supabase's auth.inviteUserByEmail if available
      
      // For now, we'll simulate the invitation
      toast({
        title: 'Invitation Sent',
        description: `Invitation email sent to ${inviteEmail}${makeAdmin ? ' with admin privileges' : ''}`,
      });
      
      setInviteEmail('');
      setMakeAdmin(false);
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    // Redirect non-admin users
    if (!loading && (!user || !isAdmin)) {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to view this page',
        variant: 'destructive'
      });
      navigate('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, navigate]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="invite">Invite Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user roles and access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        {profile.email || 'N/A'}
                      </TableCell>
                      <TableCell>{profile.role || 'user'}</TableCell>
                      <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {profile.id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(
                              profile.id, 
                              profile.role === 'admin' ? 'user' : 'admin'
                            )}
                          >
                            {profile.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle>Invite New Users</CardTitle>
              <CardDescription>Send invitation emails to new users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="make-admin"
                      checked={makeAdmin}
                      onCheckedChange={(checked) => setMakeAdmin(!!checked)}
                    />
                    <Label htmlFor="make-admin">Make admin user</Label>
                  </div>
                  
                  <Button onClick={sendInvitation}>
                    Send Invitation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Alternative Dialog for Inviting Users */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-8 right-8">
            Invite User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new user
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="invite-admin"
                checked={makeAdmin}
                onCheckedChange={(checked) => setMakeAdmin(!!checked)}
              />
              <Label htmlFor="invite-admin">Make admin user</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={sendInvitation}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin; 