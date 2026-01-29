const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(cors()); // Agar frontend bisa akses
app.use(bodyParser.json());

// --- Konfigurasi gRPC Client ---
const PROTO_PATH = path.join(__dirname, 'protos/recycle.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, defaults: true, oneofs: true });
const proto = grpc.loadPackageDefinition(packageDefinition).recycle;

const clientRecycle = new proto.RecycleService('localhost:50051', grpc.credentials.createInsecure());
const clientAuth = new proto.AuthService('localhost:50051', grpc.credentials.createInsecure());

// --- ROUTES ---

// 1. Login Route
app.post('/api/login', (req, res) => {
  clientAuth.Login(req.body, (err, response) => {
    if (response.error) return res.status(400).json({ message: response.error });
    res.json(response);
  });
});

// 2. Register Route
app.post('/api/register', (req, res) => {
  clientAuth.Register(req.body, (err, response) => {
    if (response.error) return res.status(400).json({ message: response.error });
    res.json(response);
  });
});

// 3. Get Jenis Sampah
app.get('/api/waste-types', (req, res) => {
  clientRecycle.GetWasteTypes({}, (err, response) => {
    if (err) return res.status(500).json(err);
    res.json(response.waste_types);
  });
});

// 4. Setor Sampah (Transaksi)
app.post('/api/transaction', (req, res) => {
  // Frontend kirim: { user_id, waste_type_id, weight }
  clientRecycle.AddTransaction(req.body, (err, response) => {
    if (err) return res.status(500).json(err);
    res.json(response);
  });
});

// 5. History Transaksi
app.get('/api/history', (req, res) => {
  clientRecycle.GetAllTransactions({}, (err, response) => {
    if (err) return res.status(500).json(err);
    res.json(response.transactions);
  });
});

// Jalankan Gateway di Port 3000 (React biasanya di 5173 atau 3000)
app.listen(3001, () => {
  console.log('API Gateway berjalan di http://localhost:3001');
});