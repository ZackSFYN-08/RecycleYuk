'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Recycle, ArrowLeft, User, CreditCard, MapPin, 
  Mail, Lock, Eye, EyeOff, ArrowRight 
} from 'lucide-react';

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    alamat: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  // Handle Perubahan Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- VALIDASI ---
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan Konfirmasi Password tidak sama!");
      setLoading(false);
      return;
    }

    if (formData.nik.length !== 16 || isNaN(formData.nik)) {
      setError("NIK harus 16 digit angka!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter!");
      setLoading(false);
      return;
    }

    try {
      // 1. Daftar ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            full_name: formData.nama,
          },
        },
      });

      if (authError) throw new Error(authError.message);

      if (authData?.user) {
        // 2. Simpan Data Lengkap ke Tabel 'profiles'
        // PERBAIKAN: Menggunakan .upsert() alih-alih .insert()
        // Ini menangani kasus jika trigger database sudah membuat ID duluan
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: authData.user.id, // Primary Key yang sama dengan Auth User ID
              full_name: formData.nama,
              nik: formData.nik,
              address: formData.alamat,
              email: formData.email,
              updated_at: new Date().toISOString() // Format waktu standar ISO
            },
            { onConflict: 'id' } // Opsional: Memastikan konflik dicek pada kolom ID
          );

        if (profileError) {
          throw new Error("Gagal menyimpan data profil: " + profileError.message);
        }

        alert("Registrasi Berhasil! Silakan login.");
        router.push('/login');
      }

    } catch (err) {
      console.error("Registration Error:", err);
      // Menangani error spesifik jika user sudah terdaftar di Auth tapi gagal di Profile
      if (err.message.includes("User already registered")) {
        setError("Email ini sudah terdaftar. Silakan login.");
      } else {
        setError(err.message || "Gagal mendaftar. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative">
      {/* Floating Elements Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-300 rounded-full opacity-20 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-teal-200 rounded-full opacity-20 animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header with Brand */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
                <Recycle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">RecycleYuk</h1>
              <p className="text-green-100 text-sm">Daftar Akun Baru</p>
            </div>
          </div>

          {/* Register Form */}
          <div className="p-8">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Kembali ke Login</span>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Akun Baru</h2>
            <p className="text-gray-600 mb-8">Lengkapi data diri Anda untuk mendaftar</p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-pulse">
                <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm flex-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Nama */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              {/* NIK */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIK <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val) && val.length <= 16) handleChange(e);
                    }}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="16 digit Angka NIK"
                    required
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    rows="3"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                    placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="Min. 8 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="Ulangi password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-green-200/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <button 
                  onClick={() => router.push('/login')}
                  className="text-green-600 hover:text-green-700 font-bold hover:underline transition-all"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-green-800/60 text-sm font-medium">
          © {new Date().getFullYear()} RecycleYuk. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}