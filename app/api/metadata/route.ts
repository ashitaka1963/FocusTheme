import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AntigravityBot/1.0)',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch URL' }, { status: response.status });
        }

        const html = await response.text();

        // Simple regex to extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        return NextResponse.json({ title });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
