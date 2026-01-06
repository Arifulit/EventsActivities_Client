import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Sample system alerts data
    const alerts = [
      {
        id: '1',
        title: 'High Server Load',
        description: 'Server CPU usage at 85% for 15 minutes',
        severity: 'high' as const,
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        actionRequired: true,
        icon: 'cpu'
      },
      {
        id: '2',
        title: 'Database Backup Required',
        description: 'Scheduled backup overdue by 2 hours',
        severity: 'medium' as const,
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        actionRequired: true,
        icon: 'database'
      },
      {
        id: '3',
        title: '5 New Host Applications',
        description: 'Pending approval for host verification',
        severity: 'low' as const,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actionRequired: false,
        icon: 'shield'
      },
      {
        id: '4',
        title: 'Payment Gateway Issue',
        description: 'Stripe API latency detected',
        severity: 'critical' as const,
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        actionRequired: true,
        icon: 'credit-card'
      }
    ];

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system alerts' },
      { status: 500 }
    );
  }
}
