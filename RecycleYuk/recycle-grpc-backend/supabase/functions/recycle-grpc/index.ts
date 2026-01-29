// deno-lint-ignore-file
// @ts-nocheck: bypass all strict checks for rapid development

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Pastikan file recycle.ts ada di folder yang sama
import { 
  LoginRequest, LoginResponse, 
  ProfileRequest, ProfileResponse,
  TransactionRequest, TransactionResponse,
  WasteTypeList
} from './recycle.ts';

console.log("gRPC Function Started (Linter Disabled)");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const method = url.searchParams.get('method');

    // BACA BODY SEBAGAI BINARY
    const buffer = await req.arrayBuffer();
    const inputBytes = new Uint8Array(buffer);
    let responseData = new Uint8Array();

    console.log(`Method: ${method}, Bytes: ${inputBytes.length}`);

    if (method === 'Login') {
        const reqData = LoginRequest.decode(inputBytes);
        
        // Mock Login Logic
        if (reqData.password === 'password123' || reqData.password === '123') {
           const success = { token: "token-ok", userId: "user-1", error: "" };
           responseData = LoginResponse.encode(success).finish();
        } else {
           const fail = { error: "Password Salah" };
           responseData = LoginResponse.encode(fail).finish();
        }

    } else if (method === 'GetProfile') {
        const result = { id: "1", fullName: "User Test", role: "user" };
        responseData = ProfileResponse.encode(result).finish();

    } else if (method === 'GetWasteTypes') {
        const result = { items: [{ id: "1", name: "Plastik", pricePerKg: 3000 }] };
        responseData = WasteTypeList.encode(result).finish();
    }

    return new Response(responseData, {
      headers: { ...corsHeaders, 'Content-Type': 'application/octet-stream' },
      status: 200
    });

  } catch (error) {
    console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});