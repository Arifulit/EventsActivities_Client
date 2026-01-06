import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Fetch suggestions from database or external API
    // This would typically query your events database for matching titles/categories
    const suggestions = await fetchSearchSuggestions(query);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

// Helper function to fetch search suggestions from database
async function fetchSearchSuggestions(query: string) {
  try {
    // This would be an actual database call in production
    // Example: SELECT title, category FROM events WHERE title LIKE %query% OR category LIKE %query%
    
    // For now, return empty array to ensure no mock data
    // In production, this would be:
    // const response = await fetch(`${process.env.DATABASE_URL}/events/search-suggestions?q=${query}`);
    // return response.json();
    
    return [];
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
}
