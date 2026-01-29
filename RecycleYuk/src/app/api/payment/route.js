import { NextResponse } from 'next/server';
import process from "node:process";
const Midtrans = require('midtrans-client');

export async function POST(request) {
  const { id, amount, firstName, email, title } = await request.json();

  // Inisialisasi Core Midtrans
  const snap = new Midtrans.Snap({
    isProduction: false, // Mode Sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  });

  // Parameter Transaksi
  const parameter = {
    transaction_details: {
      order_id: `ORDER-${id}-${Date.now()}`, // ID Unik setiap transaksi
      gross_amount: amount,
    },
    item_details: [{
      id: id,
      price: amount,
      quantity: 1,
      name: title.substring(0, 50), // Midtrans membatasi nama item max 50 char
    }],
    customer_details: {
      first_name: firstName || "Warga",
      email: email || "warga@example.com",
    },
    credit_card: {
      secure: true,
    },
  };

  try {
    // Minta Token ke Server Midtrans
    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}