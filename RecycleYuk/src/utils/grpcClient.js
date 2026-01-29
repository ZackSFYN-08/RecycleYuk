import { 
  LoginRequest, LoginResponse, 
  ProfileRequest, ProfileResponse, 
  TransactionRequest, TransactionResponse,
  WasteTypeList
} from '../lib/recycle.ts'; 

// Pastikan file route proxy Anda ada di src/app/api/grpc-proxy/route.js
const FUNCTION_URL = "/api/grpc-proxy";

async function callGrpc(methodName, requestData, RequestType, ResponseType) {
  try {
    // 1. Safety Check
    if (RequestType && typeof RequestType.encode !== 'function') {
      throw new Error(`Proto definition untuk ${methodName} salah/tidak ditemukan.`);
    }

    // 2. Encode Request
    let reqBuffer = new Uint8Array();
    if (RequestType) {
        reqBuffer = RequestType.encode(requestData).finish();
    }
    
    // 3. Fetch ke Proxy
    const res = await fetch(`${FUNCTION_URL}?method=${methodName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: reqBuffer
    });
    
    // 4. Handle Error
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      
      if (errorText.includes("is not valid JSON") || errorText.includes("Unexpected token")) {
         throw new Error("DEPLOY BACKEND BELUM UPDATE: Server masih pakai kode lama.");
      }
      
      throw new Error(`Server Error (${res.status}): ${errorText}`);
    }
    
    // 5. Decode Response
    const buffer = await res.arrayBuffer();
    return ResponseType ? ResponseType.decode(new Uint8Array(buffer)) : null;

  } catch (error) {
    console.error(`[gRPC Failure] ${methodName}:`, error);
    throw error;
  }
}

// PERBAIKAN: Menambahkan 'await' agar warning "async arrow function" hilang
export const grpcApi = {
  login: async ({ email, password }) => {
    return await callGrpc('Login', { email, password }, LoginRequest, LoginResponse);
  },
  getProfile: async ({ userId }) => {
    return await callGrpc('GetProfile', { userId }, ProfileRequest, ProfileResponse);
  },
  recordTransaction: async (data) => {
    return await callGrpc('RecordTransaction', data, TransactionRequest, TransactionResponse);
  },
  getWasteTypes: async () => {
    return await callGrpc('GetWasteTypes', {}, null, WasteTypeList);
  }
};

export { callGrpc };