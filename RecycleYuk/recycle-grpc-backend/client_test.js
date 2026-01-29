const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'src/protos/recycle.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const recycleProto = grpc.loadPackageDefinition(packageDefinition).recycle;

const client = new recycleProto.RecycleService('localhost:50051', grpc.credentials.createInsecure());

console.log("1. Mengambil Daftar Jenis Sampah...");
client.GetWasteTypes({}, (err, response) => {
    if (err) return console.error("Error GetTypes:", err);
    
    console.log("Daftar Sampah:", response.waste_types);

    // Ambil ID sampah pertama untuk testing
    const firstWaste = response.waste_types[0];
    if (!firstWaste) return console.log("Belum ada data sampah di DB! Jalankan seed SQL dulu.");

    console.log(`\n2. Mencoba setor ${firstWaste.name} seberat 5kg...`);
    
    client.AddTransaction({
        user_id: "user-test-uuid", // Nanti ini dari login user asli
        waste_type_id: firstWaste.id, // Pakai ID dari database
        weight: 5.0
    }, (err, resAdd) => {
        if (err) return console.error("Error Add:", err);
        console.log("Hasil Setor:", resAdd);

        console.log("\n3. Cek History Transaksi...");
        client.GetAllTransactions({}, (err, resGet) => {
            if (err) console.error("Error Get History:", err);
            else console.log(JSON.stringify(resGet, null, 2));
        });
    });
});