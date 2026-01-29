import { NextResponse } from 'next/server'

const SUPABASE_FUNCTION_URL = 'https://bvigrmajwdfpavxmxefl.supabase.co/functions/v1/recycle-grpc';

export async function POST(request) {
  try {
    console.log('[API Proxy] Request received');
    
    // Get method name dari query params
    const { searchParams } = new URL(request.url);
    const methodName = searchParams.get('method');
    
    console.log('[API Proxy] Method:', methodName);
    
    if (!methodName) {
      return NextResponse.json(
        { error: 'Method name is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log('[API Proxy] Has auth:', !!authHeader);
    
    // Read binary body
    const body = await request.arrayBuffer();
    console.log(`[API Proxy] Body size: ${body.byteLength} bytes`);
    
    // Forward request ke Supabase Edge Function
    console.log('[API Proxy] Forwarding to:', SUPABASE_FUNCTION_URL);
    
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': authHeader || '',
        'x-grpc-method': methodName,
      },
      body: body,
    });

    console.log(`[API Proxy] Supabase response:`, {
      status: response.status,
      statusText: response.statusText
    });
    
    // Forward response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Proxy] Error:`, errorText);
      return new NextResponse(errorText, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Return binary response
    const responseBuffer = await response.arrayBuffer();
    console.log(`[API Proxy] Success, response size: ${responseBuffer.byteLength} bytes`);
    
    return new NextResponse(responseBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
    
  } catch (error) {
    console.error('[API Proxy] Fatal error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}