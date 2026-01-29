require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const authService = require('./services/authService');
const path = require('path');

// Import Service Implementation
const recycleService = require('./services/recycleService');

// Load Proto File
const PROTO_PATH = path.join(__dirname, 'protos/recycle.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const recycleProto = grpc.loadPackageDefinition(packageDefinition).recycle;

// Start Server
const server = new grpc.Server();

// 1. Service Recycle
server.addService(recycleProto.RecycleService.service, {
  GetWasteTypes: recycleService.getWasteTypes,
  AddTransaction: recycleService.addTransaction,
  GetAllTransactions: recycleService.getAllTransactions
});

// 2. Service Auth (BARU)
server.addService(recycleProto.AuthService.service, {
  Register: authService.register,
  Login: authService.login
});

// --- BAGIAN PENTING: DAFTARKAN SEMUA SERVICE ---
server.addService(recycleProto.RecycleService.service, {
  GetWasteTypes: recycleService.getWasteTypes,       // <-- Pastikan baris ini ada!
  AddTransaction: recycleService.addTransaction,
  GetAllTransactions: recycleService.getAllTransactions
});
// -----------------------------------------------

const PORT = process.env.PORT || 50051;

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Server gRPC berjalan di port ${port}`);
});