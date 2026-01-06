import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';
    const category = searchParams.get('category');

    // Generate mock event data
    const generateEventData = (period: string) => {
      const days = period.includes('7') ? 7 : period.includes('30') ? 30 : 90;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          totalEvents: Math.floor(Math.random() * 20) + 10,
          activeEvents: Math.floor(Math.random() * 15) + 5,
          completedEvents: Math.floor(Math.random() * 10) + 3,
          cancelledEvents: Math.floor(Math.random() * 3) + 1,
          newEvents: Math.floor(Math.random() * 8) + 2,
          totalBookings: Math.floor(Math.random() * 200) + 100,
          averageAttendance: Math.floor(Math.random() * 50) + 20,
          averageRating: (Math.random() * 2 + 3).toFixed(1)
        });
      }
      
      return data;
    };

    const eventData = generateEventData(period);

    // Event categories breakdown
    const categories = [
      { name: 'Sports', count: 234, percentage: 28.5, color: '#3B82F6' },
      { name: 'Music', count: 189, percentage: 23.1, color: '#8B5CF6' },
      { name: 'Business', count: 156, percentage: 19.0, color: '#10B981' },
      { name: 'Education', count: 123, percentage: 15.0, color: '#F59E0B' },
      { name: 'Social', count: 89, percentage: 10.8, color: '#EF4444' },
      { name: 'Other', count: 30, percentage: 3.6, color: '#6B7280' }
    ];

    // Top performing events
    const topEvents = [
      {
        id: '1',
        title: 'Summer Music Festival',
        category: 'Music',
        attendees: 1250,
        revenue: 25600,
        rating: 4.8,
        date: '2024-06-15'
      },
      {
        id: '2',
        title: 'Tech Conference 2024',
        category: 'Business',
        attendees: 890,
        revenue: 18900,
        rating: 4.7,
        date: '2024-06-10'
      },
      {
        id: '3',
        title: 'Marathon Championship',
        category: 'Sports',
        attendees: 2100,
        revenue: 31500,
        rating: 4.9,
        date: '2024-06-05'
      }
    ];

    // Summary statistics
    const summary = {
      totalEvents: 821,
      activeEvents: 156,
      completedEvents: 589,
      cancelledEvents: 76,
      totalBookings: 15420,
      averageAttendance: 45,
      averageRating: 4.6,
      eventGrowthRate: 12.8,
      completionRate: 71.7,
      cancellationRate: 9.3
    };

    return NextResponse.json({
      success: true,
      data: {
        period,
        dailyData: eventData,
        categories,
        topEvents,
        summary,
        chartData: eventData.map(item => ({
          date: item.date,
          totalEvents: item.totalEvents,
          activeEvents: item.activeEvents,
          completedEvents: item.completedEvents,
          newEvents: item.newEvents
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event analytics' },
      { status: 500 }
    );
  }
}
