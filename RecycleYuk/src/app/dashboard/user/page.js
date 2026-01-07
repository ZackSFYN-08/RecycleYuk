"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { MENUS } from '@/config/dashboardMenus';
import {
    Trash2, CheckCircle, Award, Truck, MapPin, 
    Camera, Phone, Star, User, Bell, BookOpen, AlertCircle, 
    X, Calendar, Clock, FileText, Download, CreditCard, 
    Lock, ChevronRight, Info, Lightbulb
} from 'lucide-react';

export default function WargaDashboard() {
    const [activePage, setActivePage] = useState('dashboard');
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    // --- STATES ---
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedHistory, setSelectedHistory] = useState(null);
    
    // State Profile Form
    const [profileData, setProfileData] = useState({
        name: 'Ibu Siti Aminah',
        email: 'siti.aminah@email.com',
        phone: '081234567890',
        address: 'Jl. Mawar No.5, RT 001/RW 003, Kelurahan Sukamaju',
        password: ''
    });

    // --- MOCK DATA ---
    const stats = {
        totalWaste: 156, // kg
        lastPickup: '20 Des 2024',
        points: 1560,
        level: 'Gold Member'
    };

    const activePickup = {
        id: 'PU-999',
        status: 'On The Way', // On The Way, Scheduled, Completed
        driver: 'Budi Santoso',
        vehicle: 'Truk B 1234 XYZ',
        phone: '081299998888',
        eta: '15 Menit',
        currentLocation: 'Jl. Sudirman (2km lagi)'
    };

    const pickupHistory = [
        { id: 'PU-101', date: '2024-12-15', time: '09:00', type: 'Organik', weight: 15, status: 'Selesai', paymentStatus: 'Lunas', fee: 15000, driver: 'Budi Santoso' },
        { id: 'PU-102', date: '2024-12-10', time: '14:00', type: 'Anorganik', weight: 8, status: 'Selesai', paymentStatus: 'Lunas', fee: 10000, driver: 'Ahmad Fauzi' },
        { id: 'PU-103', date: '2024-12-01', time: '10:30', type: 'B3', weight: 2, status: 'Selesai', paymentStatus: 'Lunas', fee: 25000, driver: 'Udin Sedunia' },
    ];

    const notifications = [
        { id: 1, title: 'Pickup Dijadwalkan', msg: 'Request pickup Anda untuk besok pukul 09:00 telah dikonfirmasi.', time: '1 jam lalu', type: 'info' },
        { id: 2, title: 'Driver Menuju Lokasi', msg: 'Driver Budi sedang dalam perjalanan ke lokasi Anda.', time: 'Hari ini, 08:30', type: 'alert' },
        { id: 3, title: 'Promo Tukar Poin', msg: 'Tukarkan 1000 poin dengan voucher listrik!', time: 'Kemarin', type: 'promo' },
    ];

    const educationContent = [
        { id: 1, title: 'Cara Memilah Sampah Organik', cat: 'Panduan', desc: 'Pisahkan sisa makanan dan dedaunan untuk dijadikan kompos.', icon: Trash2 },
        { id: 2, title: 'Bahaya Sampah B3', cat: 'Info Penting', desc: 'Jangan buang baterai dan lampu bekas sembarangan.', icon: AlertCircle },
        { id: 3, title: 'Daur Ulang Plastik', cat: 'Kreatif', desc: 'Ubah botol bekas menjadi pot tanaman cantik.', icon: Lightbulb },
    ];

    // --- UTILS ---
    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('id-ID')), 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-100 text-green-700';
            case 'Menunggu': return 'bg-yellow-100 text-yellow-700';
            case 'Batal': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-black';
        }
    };

    // --- RENDER FUNCTIONS (TABS) ---

    const renderDashboard = () => (
        <div className="space-y-6 text-black">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Halo, {profileData.name.split(' ')[1]}! 👋</h2>
                    <p className="text-green-100 text-sm">Selamat datang kembali di RecycleYuk.</p>
                </div>
                <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <Award size={24} className="mx-auto mb-1" />
                    <p className="text-xs font-bold">{stats.level}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Sampah', val: `${stats.totalWaste} kg`, sub: 'Total kontribusi Anda', icon: Trash2, col: 'blue' },
                    { label: 'Pickup Terakhir', val: stats.lastPickup, sub: 'Lihat detail di histori', icon: Calendar, col: 'purple' },
                    { label: 'Poin Rewards', val: stats.points, sub: 'Tukarkan di katalog', icon: Award, col: 'orange' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-1 text-black">{stat.val}</h3>
                                <p className="text-green-600 text-xs mt-1">{stat.sub}</p>
                            </div>
                            <div className={`bg-${stat.col}-100 p-3 rounded-lg text-${stat.col}-600`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-black">Status Pickup Terbaru</h3>
                    {activePickup ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold animate-pulse">Sedang Berjalan</span>
                    ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">Tidak ada aktivitas</span>
                    )}
                </div>
                
                {activePickup ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 text-white p-3 rounded-lg"><Truck size={24} /></div>
                            <div>
                                <p className="font-bold text-black text-lg">{activePickup.status}</p>
                                <p className="text-sm text-black">Driver: {activePickup.driver} • {activePickup.vehicle}</p>
                            </div>
                        </div>
                        <button onClick={() => setActivePage('tracking')} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium transition shadow-sm">
                            Lacak Lokasi
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                        <Truck size={32} className="mx-auto mb-2 opacity-50"/>
                        <p>Belum ada request pickup aktif.</p>
                        <button onClick={() => setActivePage('request')} className="mt-2 text-green-600 font-bold hover:underline">Buat Request Baru</button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRequest = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2"><Truck size={20}/> Form Request Pickup</h3>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">Jenis Sampah *</label>
                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 bg-white text-black" required>
                                <option value="">Pilih jenis sampah...</option>
                                <option value="organik">Organik (Sisa Makanan)</option>
                                <option value="anorganik">Anorganik (Plastik/Kertas)</option>
                                <option value="b3">B3 (Elektronik/Baterai)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">Estimasi Berat (kg) *</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-black" placeholder="Contoh: 5" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">Tanggal Penjemputan *</label>
                            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-black bg-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">Waktu Penjemputan *</label>
                            <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-black bg-white" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Catatan Khusus</label>
                        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 text-black h-24" placeholder="Contoh: Lokasi di belakang rumah, pagar hitam..."></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Upload Foto (Opsional)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition cursor-pointer bg-gray-50">
                            <input type="file" className="hidden" id="photo-upload" onChange={(e) => e.target.files[0] && setSelectedImage(URL.createObjectURL(e.target.files[0]))} />
                            <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} alt="Preview" className="max-h-40 rounded mb-2 shadow-sm" />
                                        <p className="text-sm text-green-600 font-medium">Ganti Foto</p>
                                    </>
                                ) : (
                                    <><Camera size={32} className="text-gray-400 mb-2" /><p className="text-sm text-gray-500">Klik untuk upload foto sampah</p></>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setActivePage('dashboard')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition text-black">Batal</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition shadow-md">Kirim Request</button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2"><FileText size={20}/> Histori Pengangkutan</h3>
                <div className="space-y-4">
                    {pickupHistory.map((pickup) => (
                        <div key={pickup.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition cursor-pointer relative group">
                            <div className="flex gap-4 items-center mb-2 md:mb-0">
                                <div className="bg-green-100 p-3 rounded-lg"><Trash2 size={24} className="text-green-600" /></div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-black">{pickup.type}</p>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(pickup.status)}`}>{pickup.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{pickup.date} • {pickup.time}</p>
                                    <p className="text-xs text-black font-medium mt-1">Berat: {pickup.weight} kg</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right w-full md:w-auto">
                                <p className="font-bold text-black text-lg">Rp {pickup.fee.toLocaleString('id-ID')}</p>
                                <p className="text-xs text-green-600 font-bold flex items-center gap-1 md:justify-end"><CheckCircle size={12}/> {pickup.paymentStatus}</p>
                                <div className="mt-2 flex gap-2 justify-end">
                                    <button onClick={() => setSelectedHistory(pickup)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded border border-blue-100 hover:bg-blue-100">Detail</button>
                                    <button onClick={() => alert("Mengunduh Invoice...")} className="text-xs border border-gray-300 text-black px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1"><Download size={12}/> Invoice</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderTracking = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2"><MapPin size={20}/> Tracking Real-time</h3>
                
                {/* Driver Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <div className="bg-blue-600 text-white p-3 rounded-full h-fit"><User size={24} /></div>
                            <div>
                                <p className="font-bold text-lg text-black">{activePickup.driver}</p>
                                <p className="text-sm text-black">{activePickup.vehicle}</p>
                                <div className="flex text-yellow-500 text-xs mt-1 gap-0.5"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Estimasi Tiba</p>
                            <p className="text-xl font-bold text-blue-600">{activePickup.eta}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2"><Phone size={16}/> Hubungi Driver</button>
                    </div>
                </div>

                {/* Map Simulation */}
                <div className="bg-gray-200 rounded-xl h-80 flex flex-col items-center justify-center border-2 border-gray-300 relative overflow-hidden text-black">
                    <MapPin size={48} className="text-red-500 mb-2 animate-bounce relative z-10" />
                    <p className="font-bold relative z-10">Peta Google Maps (Simulasi)</p>
                    <p className="text-xs text-gray-600 relative z-10">Posisi: {activePickup.currentLocation}</p>
                    
                    {/* Grid Background Effect */}
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2"><User size={20}/> Edit Profil</h3>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold">Nama Lengkap</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" value={profileData.name} onChange={(e)=>setProfileData({...profileData, name:e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Email</label>
                            <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" value={profileData.email} onChange={(e)=>setProfileData({...profileData, email:e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Nomor Telepon</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" value={profileData.phone} onChange={(e)=>setProfileData({...profileData, phone:e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold">Alamat Lengkap</label>
                        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black h-20" value={profileData.address} onChange={(e)=>setProfileData({...profileData, address:e.target.value})} />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-md font-bold mb-4 flex items-center gap-2"><Lock size={16}/> Ganti Password</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="password" placeholder="Password Baru" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" />
                            <input type="password" placeholder="Konfirmasi Password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="button" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2"><Bell size={20}/> Notifikasi</h3>
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 rounded-xl border flex gap-4 ${notif.type === 'alert' ? 'bg-red-50 border-red-100' : notif.type === 'promo' ? 'bg-yellow-50 border-yellow-100' : 'bg-blue-50 border-blue-100'}`}>
                            <div className={`p-2 rounded-full h-fit ${notif.type === 'alert' ? 'bg-red-200 text-red-700' : notif.type === 'promo' ? 'bg-yellow-200 text-yellow-700' : 'bg-blue-200 text-blue-700'}`}>
                                {notif.type === 'alert' ? <AlertCircle size={20}/> : notif.type === 'promo' ? <Award size={20}/> : <Info size={20}/>}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-black">{notif.title}</h4>
                                    <span className="text-xs text-gray-500">{notif.time}</span>
                                </div>
                                <p className="text-sm text-black mt-1">{notif.msg}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderEducation = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2"><BookOpen size={20}/> Pusat Edukasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {educationContent.map((edu) => (
                        <div key={edu.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                            <div className="h-32 bg-gray-100 flex items-center justify-center">
                                <edu.icon size={48} className="text-gray-300 group-hover:text-green-500 transition-colors"/>
                            </div>
                            <div className="p-4">
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{edu.cat}</span>
                                <h4 className="font-bold text-black mt-2 text-lg">{edu.title}</h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{edu.desc}</p>
                                <button className="mt-4 text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline">Baca Selengkapnya <ChevronRight size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER SWITCH ---
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return renderDashboard();
            case 'request': return renderRequest();
            case 'history': return renderHistory();
            case 'tracking': return renderTracking();
            case 'profile': return renderProfile();
            case 'notifikasi': return renderNotifications();
            case 'edukasi': return renderEducation();
            default: return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <DashboardLayout
            user={{ name: profileData.name, role: stats.level }}
            menuItems={MENUS.warga}
            activePage={activePage}
            setActivePage={setActivePage}
        >
            <div className="mb-6 flex justify-between items-end text-black">
                <div>
                    <h2 className="text-2xl font-bold capitalize">{activePage === 'dashboard' ? 'Dashboard Warga' : activePage.replace('-', ' ')}</h2>
                    <p className="text-sm mt-1">Kelola sampah Anda dengan mudah.</p>
                </div>
                <div className="text-sm font-medium bg-gray-100 px-3 py-1 rounded flex items-center gap-2 border border-gray-200">
                    <Clock size={14}/> {mounted ? currentTime : 'Loading...'}
                </div>
            </div>

            {renderContent()}

            {/* --- MODAL DETAIL HISTORY --- */}
            {selectedHistory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between mb-4 border-b pb-4">
                            <h3 className="font-bold text-lg text-black">Detail Transaksi</h3>
                            <button onClick={() => setSelectedHistory(null)}><X size={20} className="text-black hover:text-red-500"/></button>
                        </div>
                        <div className="space-y-3 text-sm text-black">
                            <div className="flex justify-between border-b pb-2"><span>ID Pickup</span><span className="font-bold">{selectedHistory.id}</span></div>
                            <div className="flex justify-between border-b pb-2"><span>Tanggal</span><span>{selectedHistory.date}, {selectedHistory.time}</span></div>
                            <div className="flex justify-between border-b pb-2"><span>Jenis Sampah</span><span>{selectedHistory.type}</span></div>
                            <div className="flex justify-between border-b pb-2"><span>Berat</span><span>{selectedHistory.weight} kg</span></div>
                            <div className="flex justify-between border-b pb-2"><span>Driver</span><span>{selectedHistory.driver}</span></div>
                            <div className="flex justify-between items-center pt-2">
                                <span>Total Biaya</span>
                                <span className="font-bold text-lg text-blue-600">Rp {selectedHistory.fee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="bg-green-50 p-2 rounded text-center text-green-700 font-bold text-xs mt-2 border border-green-200">
                                STATUS PEMBAYARAN: {selectedHistory.paymentStatus.toUpperCase()}
                            </div>
                        </div>
                        <button onClick={() => setSelectedHistory(null)} className="w-full mt-6 py-2 bg-gray-100 text-black font-bold rounded-lg hover:bg-gray-200">Tutup</button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}