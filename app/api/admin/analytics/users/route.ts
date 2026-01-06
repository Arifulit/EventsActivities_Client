import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';

    // Generate mock data based on period
    const generateUserData = (period: string) => {
      const days = period.includes('7') ? 7 : period.includes('30') ? 30 : 90;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          newUsers: Math.floor(Math.random() * 50) + 20,
          activeUsers: Math.floor(Math.random() * 200) + 100,
          returningUsers: Math.floor(Math.random() * 100) + 50,
          totalUsers: 15000 + (days - i) * 15,
          verifiedUsers: 12000 + (days - i) * 12,
          bannedUsers: 200 + Math.floor(Math.random() * 5)
        });
      }
      
      return data;
    };

    const userData = generateUserData(period);

    // Summary statistics
    const summary = {
      totalUsers: userData[userData.length - 1].totalUsers,
      newUsersThisPeriod: userData.reduce((sum, day) => sum + day.newUsers, 0),
      activeUsersThisPeriod: userData.reduce((sum, day) => sum + day.activeUsers, 0),
      averageDailyActive: Math.floor(userData.reduce((sum, day) => sum + day.activeUsers, 0) / userData.length),
      userGrowthRate: 18.5,
      retentionRate: 72.3,
      verificationRate: 83.2
    };

    return NextResponse.json({
      success: true,
      data: {
        period,
        dailyData: userData,
        summary,
        chartData: userData.map(item => ({
          date: item.date,
          newUsers: item.newUsers,
          activeUsers: item.activeUsers,
          totalUsers: item.totalUsers
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user analytics' },
      { status: 500 }
    );
  }
}
