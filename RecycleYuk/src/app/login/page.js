"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter(); // Inisialisasi router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- KONFIGURASI AKUN & REDIRECT SESUAI PATH BARU ---
  // Path disesuaikan dengan: src/app/components/dashboard/[role]/page.js
  // Maka URL route-nya menjadi: /components/dashboard/[role]
  const demoAccounts = {
    admin: { 
      email: 'admin@recycleyuk.com', 
      password: 'admin123', 
      redirect: '/dashboard/admin' 
    },
    lurah: { 
      email: 'lurah@recycleyuk.com', 
      password: 'lurah123', 
      redirect: '/dashboard/kepala' 
    },
    user: { 
      email: 'user@recycleyuk.com', 
      password: 'user123', 
      redirect: '/dashboard/user' 
    },
    driver: { 
      email: 'driver@recycleyuk.com', 
      password: 'driver123', 
      redirect: '/dashboard/driver' 
    }
  };

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Administrator Sistem' },
    { value: 'lurah', label: 'Kepala Lurah/RW/RT', description: 'Pengelola Wilayah' },
    { value: 'user', label: 'User (Rumah Warga)', description: 'Pengguna Layanan' },
    { value: 'driver', label: 'Driver Pengangkut', description: 'Supir Truk' }
  ];

  const handleLogin = (e) => {
    e.preventDefault(); // Mencegah reload form default
    setIsLoading(true);
    setError('');
    
    // Simulasi proses login
    setTimeout(() => {
      // Ambil data akun berdasarkan role yang dipilih (atau check semua jika ingin auto-detect)
      // Disini kita validasi berdasarkan role yang dipilih di dropdown agar lebih spesifik
      const account = demoAccounts[role];
      
      // Validasi sederhana
      if (email === account.email && password === account.password) {
        setIsLoading(false);
        // Simpan sesi (Contoh sederhana menggunakan localStorage)
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
        
        // Redirect menggunakan Next.js Router ke path yang diminta
        console.log("Redirecting to:", account.redirect); // Debugging log
        router.push(account.redirect);
      } else {
        setIsLoading(false);
        setError(`Email atau password salah untuk role ${roles.find(r => r.value === role)?.label}.`);
      }
    }, 1500);
  };

  // Helper untuk mengisi form otomatis (untuk demo button)
  const fillDemo = (selectedRole) => {
    setRole(selectedRole); // Update dropdown role
    const acc = demoAccounts[selectedRole];
    if (acc) {
      setEmail(acc.email);
      setPassword(acc.password);
      setError('');
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

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header with Brand */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
            <div className="relative z-10">
              {/* Logo RecycleYuk */}
              <div className="inline-flex items-center justify-center mb-4 bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <h1 className="text-2xl font-bold tracking-wider">RecycleYuk</h1>
              </div>
              <p className="text-green-50 text-sm">Platform Manajemen Sampah Terpadu</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang!</h2>
            <p className="text-gray-600 mb-6">Masuk untuk melanjutkan ke dashboard</p>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Demo Account Hint (Helper UI) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                <p className="text-blue-800 font-bold mb-1">💡 Akun Demo ({roles.find(r => r.value === role)?.label}):</p>
                <div className="flex justify-between text-blue-600">
                    <span>{demoAccounts[role].email}</span>
                    <span className="font-mono">{demoAccounts[role].password}</span>
                </div>
              </div>

              {/* Email Input */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500" />
                  <span className="ml-2 text-gray-600">Ingat saya</span>
                </label>
                <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                  Lupa password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-100">
               <div className="flex items-center justify-center gap-2 mb-3 text-gray-400">
                  <Info size={14} />
                  <span className="text-xs uppercase font-bold tracking-wider">Quick Fill (Demo)</span>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                        key={r.value}
                        onClick={() => fillDemo(r.value)}
                        className={`text-xs py-2 px-2 rounded border transition-colors ${role === r.value ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {r.label}
                    </button>
                  ))}
               </div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <button 
                  type="button"
                  onClick={() => router.push('/register')}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Daftar sekarang
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