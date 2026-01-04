'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { UserCheck, Clock, CheckCircle, XCircle, Mail, Calendar } from 'lucide-react';

export default function AdminApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Host Approvals</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export List</Button>
          <Button>Review All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5d</div>
            <p className="text-xs text-muted-foreground">
              -0.5d from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                name: 'Alex Thompson', 
                email: 'alex@example.com', 
                applied: 'Dec 12, 2024',
                experience: '5 years event management',
                events: 'Music festivals, corporate events',
                reason: 'Looking to expand my professional network',
                documents: ['Resume', 'Portfolio', 'References'],
                status: 'pending'
              },
              { 
                name: 'Maria Garcia', 
                email: 'maria@example.com', 
                applied: 'Dec 11, 2024',
                experience: '3 years workshop hosting',
                events: 'Cooking classes, art workshops',
                reason: 'Passionate about teaching others',
                documents: ['Resume', 'Certifications'],
                status: 'pending'
              },
              { 
                name: 'David Chen', 
                email: 'david@example.com', 
                applied: 'Dec 10, 2024',
                experience: '7 years sports coaching',
                events: 'Fitness classes, sports tournaments',
                reason: 'Want to promote healthy living',
                documents: ['Resume', 'Certificates', 'Insurance'],
                status: 'pending'
              },
            ].map((application, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{application.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-1" />
                        {application.email}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Applied: {application.applied}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Review
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Experience</h4>
                    <p className="text-sm text-gray-600">{application.experience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Event Types</h4>
                    <p className="text-sm text-gray-600">{application.events}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Reason for Joining</h4>
                    <p className="text-sm text-gray-600">{application.reason}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Documents</h4>
                    <div className="flex flex-wrap gap-1">
                      {application.documents.map((doc, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline">
                      Download Documents
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="destructive">
                      Reject
                    </Button>
                    <Button size="sm">
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
