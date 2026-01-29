// deno-lint-ignore-file
const supabase = require('../config/supabase.js');

// 1. Ambil daftar sampah untuk ditampilkan di Frontend
const getWasteTypes = async (call, callback) => {
  try {
    const { data, error } = await supabase.from('waste_types').select('*');
    if (error) throw error;

    const waste_types = data.map(item => ({
      id: item.id,
      name: item.name,
      price_per_kg: item.price_per_kg,
      unit: item.unit
    }));

    callback(null, { waste_types });
  } catch (error) {
    console.error("Error GetWasteTypes:", error);
    callback({ code: 13, details: "Gagal mengambil data jenis sampah" });
  }
};

// 2. Tambah Transaksi dengan Perhitungan Otomatis
const addTransaction = async (call, callback) => {
  const { user_id, waste_type_id, weight } = call.request;

  try {
    // A. Cari tahu dulu harga sampah per kg nya berapa
    const { data: wasteData, error: wasteError } = await supabase
      .from('waste_types')
      .select('price_per_kg')
      .eq('id', waste_type_id)
      .single();

    if (wasteError || !wasteData) {
      return callback({ code: 5, details: "Jenis sampah tidak ditemukan/salah ID" });
    }

    // B. Hitung total harga otomatis
    const total_price = weight * wasteData.price_per_kg;

    // C. Simpan ke database
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ 
        user_id, 
        waste_type_id, 
        weight, 
        total_price,
        status: 'pending' 
      }])
      .select()
      .single();

    if (error) throw error;

    callback(null, {
      id: data.id,
      status: "SUCCESS",
      message: "Transaksi berhasil! Saldo bertambah.",
      total_price: parseFloat(data.total_price)
    });

  } catch (error) {
    console.error("Error AddTransaction:", error);
    callback({ code: 13, details: "Gagal memproses transaksi" });
  }
};

// 3. Ambil History dengan Join Table (Relasi)
const getAllTransactions = async (call, callback) => {
  try {
    // Syntax Supabase untuk Join: select('*, tabel_relasi(kolom)')
    const { data, error } = await supabase
      .from('transactions')
      .select('*, waste_types(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transactions = data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      waste_type_name: item.waste_types?.name || "Unknown", // Ambil nama dari relasi
      weight: item.weight,
      total_price: item.total_price,
      created_at: item.created_at
    }));

    callback(null, { transactions });
  } catch (error) {
    console.error(error);
    callback({ code: 13, details: "Gagal mengambil history" });
  }
};

module.exports = { getWasteTypes, addTransaction, getAllTransactions };