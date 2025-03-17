import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const AdminSettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Settings</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" defaultValue="BookCircuit Exchange" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="site-description">Site Description</Label>
              <Input id="site-description" defaultValue="A platform for book enthusiasts to exchange books" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the site for maintenance
                </p>
              </div>
              <Switch id="maintenance-mode" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email Settings</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input id="from-email" defaultValue="noreply@bookcircuit.com" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable email notifications for system events
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </div>
          
          <Button type="button">Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSettingsTab; 