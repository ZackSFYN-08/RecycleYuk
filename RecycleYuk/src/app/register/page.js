"use client";

import { useState } from 'react';
import { Recycle, User, CreditCard, MapPin, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    alamat: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = () => {
    // Validasi password match
    if (formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }

    setIsLoading(true);
    
    // Simulasi proses registrasi
    setTimeout(() => {
      setIsLoading(false);
      alert('Pendaftaran berhasil! Silakan login.');
      window.location.href = '/login';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Floating Elements Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-300 rounded-full opacity-20 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-teal-200 rounded-full opacity-20 animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header with Brand */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 animate-spin-slow">
                <Recycle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">RecycleYuk</h1>
              <p className="text-green-100 text-sm">Daftar Akun Baru</p>
            </div>
          </div>

          {/* Register Form */}
          <div className="p-8">
            <button
              onClick={() => window.location.href = '/login'}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Kembali ke Login</span>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Akun Baru</h2>
            <p className="text-gray-600 mb-6">Lengkapi data diri Anda untuk mendaftar</p>

            <div className="space-y-4">
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
                  NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    maxLength="16"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="16 digit NIK"
                    required
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap (Blok/Nomor) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    rows="3"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                    placeholder="Contoh: Jl. Merdeka No. 123, Blok A, RT 01/RW 02"
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
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Minimal 8 karakter"
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

              {/* Confirm Password */}
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
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
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

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2 text-sm">
                <input 
                  type="checkbox" 
                  id="terms"
                  className="w-4 h-4 mt-1 text-green-500 border-gray-300 rounded focus:ring-green-500" 
                  required
                />
                <label htmlFor="terms" className="text-gray-600 cursor-pointer">
                  Saya setuju dengan{' '}
                  <button className="text-green-600 hover:text-green-700 font-medium">
                    Syarat & Ketentuan
                  </button>
                  {' '}dan{' '}
                  <button className="text-green-600 hover:text-green-700 font-medium">
                    Kebijakan Privasi
                  </button>
                </label>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mendaftar...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          © 2024 RecycleYuk. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}