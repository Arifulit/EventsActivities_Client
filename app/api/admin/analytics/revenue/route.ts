import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';
    const source = searchParams.get('source'); // bookings, events, subscriptions, etc.

    // Generate mock revenue data
    const generateRevenueData = (period: string) => {
      const days = period.includes('7') ? 7 : period.includes('30') ? 30 : 90;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const totalRevenue = Math.floor(Math.random() * 5000) + 2000;
        
        data.push({
          date: date.toISOString().split('T')[0],
          totalRevenue,
          bookingRevenue: Math.floor(totalRevenue * 0.6),
          eventRevenue: Math.floor(totalRevenue * 0.25),
          subscriptionRevenue: Math.floor(totalRevenue * 0.1),
          otherRevenue: Math.floor(totalRevenue * 0.05),
          transactions: Math.floor(Math.random() * 100) + 50,
          averageTransactionValue: (totalRevenue / (Math.floor(Math.random() * 100) + 50)).toFixed(2),
          refunds: Math.floor(Math.random() * 200) + 50,
          netRevenue: totalRevenue - (Math.floor(Math.random() * 200) + 50)
        });
      }
      
      return data;
    };

    const revenueData = generateRevenueData(period);

    // Revenue sources breakdown
    const revenueSources = [
      { name: 'Event Bookings', amount: 45678.90, percentage: 60.2, color: '#3B82F6', growth: 23.5 },
      { name: 'Ticket Sales', amount: 18923.45, percentage: 25.0, color: '#8B5CF6', growth: 18.2 },
      { name: 'Subscriptions', amount: 7567.89, percentage: 10.0, color: '#10B981', growth: 45.6 },
      { name: 'Other', amount: 3789.23, percentage: 4.8, color: '#F59E0B', growth: -5.2 }
    ];

    // Monthly comparison
    const monthlyComparison = [
      { month: 'Jan', revenue: 45234.56, growth: 12.3 },
      { month: 'Feb', revenue: 48967.89, growth: 8.2 },
      { month: 'Mar', revenue: 52345.67, growth: 6.9 },
      { month: 'Apr', revenue: 49876.23, growth: -4.7 },
      { month: 'May', revenue: 56789.12, growth: 13.8 },
      { month: 'Jun', revenue: 61234.90, growth: 7.8 }
    ];

    // Top revenue generating events
    const topRevenueEvents = [
      {
        id: '1',
        title: 'Summer Music Festival',
        revenue: 25600.00,
        bookings: 1250,
        averageTicketPrice: 20.48,
        date: '2024-06-15'
      },
      {
        id: '2',
        title: 'Tech Conference 2024',
        revenue: 18900.00,
        bookings: 890,
        averageTicketPrice: 21.24,
        date: '2024-06-10'
      },
      {
        id: '3',
        title: 'Marathon Championship',
        revenue: 31500.00,
        bookings: 2100,
        averageTicketPrice: 15.00,
        date: '2024-06-05'
      }
    ];

    // Summary statistics
    const summary = {
      totalRevenue: revenueData.reduce((sum, day) => sum + day.totalRevenue, 0),
      netRevenue: revenueData.reduce((sum, day) => sum + day.netRevenue, 0),
      averageDailyRevenue: Math.floor(revenueData.reduce((sum, day) => sum + day.totalRevenue, 0) / revenueData.length),
      revenueGrowthRate: 23.5,
      totalTransactions: revenueData.reduce((sum, day) => sum + day.transactions, 0),
      averageTransactionValue: 45.67,
      refundRate: 3.2,
      profitMargin: 68.5
    };

    return NextResponse.json({
      success: true,
      data: {
        period,
        dailyData: revenueData,
        revenueSources,
        monthlyComparison,
        topRevenueEvents,
        summary,
        chartData: revenueData.map(item => ({
          date: item.date,
          totalRevenue: item.totalRevenue,
          netRevenue: item.netRevenue,
          bookingRevenue: item.bookingRevenue,
          eventRevenue: item.eventRevenue
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}
