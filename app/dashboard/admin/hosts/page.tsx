'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Users, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminHostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manage Hosts</h2>
        <Button>Add New Host</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hosts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Need review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hosts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134</div>
            <p className="text-xs text-muted-foreground">
              94.4% active rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Host Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                name: 'John Smith', 
                email: 'john@example.com', 
                applied: 'Dec 10, 2024',
                events: 0,
                status: 'pending',
                rating: 'N/A'
              },
              { 
                name: 'Sarah Johnson', 
                email: 'sarah@example.com', 
                applied: 'Dec 8, 2024',
                events: 0,
                status: 'pending',
                rating: 'N/A'
              },
              { 
                name: 'Mike Wilson', 
                email: 'mike@example.com', 
                applied: 'Dec 5, 2024',
                events: 0,
                status: 'approved',
                rating: 'N/A'
              },
              { 
                name: 'Emily Davis', 
                email: 'emily@example.com', 
                applied: 'Dec 1, 2024',
                events: 5,
                status: 'approved',
                rating: 4.8
              },
              { 
                name: 'Robert Brown', 
                email: 'robert@example.com', 
                applied: 'Nov 28, 2024',
                events: 12,
                status: 'rejected',
                rating: 'N/A'
              },
            ].map((host, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{host.name}</p>
                    <p className="text-sm text-gray-500">{host.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>Applied: {host.applied}</span>
                      <span>Events: {host.events}</span>
                      <span>Rating: {host.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      host.status === 'approved' ? 'default' : 
                      host.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                    className="text-xs"
                  >
                    {host.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {host.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {host.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {host.status}
                  </Badge>
                  {host.status === 'pending' && (
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" className="h-8">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8">
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
