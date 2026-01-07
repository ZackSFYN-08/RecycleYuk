"use client";

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { MENUS } from '@/config/dashboardMenus';
import { 
    Package, DollarSign, TrendingUp, Star, Navigation, 
    MapPin, Phone, Camera, PenTool, CheckCircle, Clock, 
    AlertCircle, User, Truck, ChevronRight, X, Save, FileText, Lock, Edit, Image as ImageIcon
} from 'lucide-react';

export default function DriverDashboard() {
    const [activePage, setActivePage] = useState('dashboard');
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    // --- 1. GLOBAL STATE DATA ---
    const [driverProfile, setDriverProfile] = useState({
        name: 'Budi Santoso',
        role: 'Driver',
        plateNumber: 'D 1234 XYZ',
        vehicleType: 'Truk Sampah 4 Roda',
        phone: '081234567890',
        email: 'budi.driver@recycle.id',
        rating: 4.8,
        totalReviews: 120,
        avatar: null
    });

    const [pickups, setPickups] = useState([
        // Active Tasks
        { id: 'PK-101', date: '2024-12-25', address: 'Jl. Mawar No. 5, Cibeber', customer: 'Ibu Siti', phone: '08123456789', type: 'Organik', estWeight: 5, actualWeight: 0, priority: 'High', status: 'Pending', fee: 15000, notes: 'Pagar warna hitam.', proof: null, review: null },
        { id: 'PK-102', date: '2024-12-25', address: 'Jl. Melati No. 10, Leuwigajah', customer: 'Pak Joko', phone: '08198765432', type: 'Anorganik', estWeight: 10, actualWeight: 0, priority: 'Normal', status: 'In Progress', fee: 20000, notes: '', proof: null, review: null },
        { id: 'PK-103', date: '2024-12-25', address: 'Toko Maju Jaya, Cimahi', customer: 'Ko Hendra', phone: '08122233344', type: 'Campur', estWeight: 25, actualWeight: 0, priority: 'Normal', status: 'Pending', fee: 50000, notes: 'Masuk lewat pintu belakang.', proof: null, review: null },
        
        // History (Completed)
        { id: 'PK-099', date: '2024-12-24', address: 'Jl. Anggrek No. 3', customer: 'Bu Rina', phone: '08111122233', type: 'Organik', estWeight: 8, actualWeight: 8, priority: 'Normal', status: 'Selesai', fee: 15000, notes: '', proof: 'https://via.placeholder.com/150', review: 'Cepat dan bersih!', rating: 5 },
    ]);

    // --- 2. LOCAL UI STATE ---
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Form States
    const [updateForm, setUpdateForm] = useState({
        status: '',
        actualWeight: '',
        note: '',
        photo: null,     // Menyimpan File object
        photoPreview: null, // Menyimpan URL preview
        isSigned: false
    });

    const [profileForm, setProfileForm] = useState({ ...driverProfile });
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // --- 3. COMPUTED DATA ---
    // Active tasks: yang belum selesai
    const activeTasks = pickups.filter(p => p.status !== 'Selesai' && p.status !== 'Canceled');
    // Completed tasks: yang statusnya selesai
    const completedTasks = pickups.filter(p => p.status === 'Selesai');
    
    const totalEarnings = useMemo(() => {
        const daily = completedTasks.filter(p => p.id.startsWith('PK-1')).reduce((acc, curr) => acc + curr.fee, 0); 
        const monthly = completedTasks.reduce((acc, curr) => acc + curr.fee, 5000000);
        return { daily, monthly };
    }, [completedTasks]);

    // --- 4. UTILS ---
    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('id-ID')), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Menuju Lokasi': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-black';
        }
    };

    // --- 5. HANDLERS (CRUD & LOGIC) ---

    const handleOpenUpdate = () => {
        if (!selectedPickup) return;

        setUpdateForm({
            status: selectedPickup.status === 'Pending' ? 'Menuju Lokasi' : selectedPickup.status,
            actualWeight: selectedPickup.estWeight || '', 
            note: selectedPickup.notes || '',
            photo: null,
            photoPreview: selectedPickup.proof || null, // Tampilkan bukti lama jika ada
            isSigned: false
        });
        setIsUpdateModalOpen(true);
    };

    // Handler Upload Gambar
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setUpdateForm(prev => ({
                ...prev,
                photo: file,
                photoPreview: previewUrl
            }));
        }
    };

    const handleSubmitUpdate = (e) => {
        e.preventDefault();
        if (!selectedPickup) return;

        // Update data pickup di state utama
        setPickups(prev => prev.map(p => {
            if (p.id === selectedPickup.id) {
                return {
                    ...p,
                    status: updateForm.status,
                    actualWeight: updateForm.status === 'Selesai' ? Number(updateForm.actualWeight) : p.actualWeight,
                    notes: updateForm.note,
                    // Simpan URL preview sebagai 'proof' (simulasi upload)
                    proof: updateForm.photoPreview || p.proof 
                };
            }
            return p;
        }));

        alert(`Sukses! Status pickup ${selectedPickup.id} diperbarui menjadi: ${updateForm.status}`);
        setIsUpdateModalOpen(false);
        setSelectedPickup(null);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setDriverProfile(profileForm);
        setIsEditingProfile(false);
        alert("Profil berhasil diperbarui!");
    };

    // --- 6. RENDER FUNCTIONS ---

    const renderDashboard = () => (
        <div className="space-y-6 text-black">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl shadow-lg p-6 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Halo, {driverProfile.name}! 🚛</h2>
                    <p className="text-green-100 text-sm">Siap mengangkut sampah hari ini?</p>
                </div>
                <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs font-bold text-green-100">{driverProfile.plateNumber}</p>
                    <div className="flex items-center justify-center gap-1 mt-1 font-bold">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" /> {driverProfile.rating}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Jadwal Hari Ini</p>
                    <h3 className="text-xl font-bold text-black">{activeTasks.length} Lokasi</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Selesai Hari Ini</p>
                    <h3 className="text-xl font-bold text-green-600">
                        {completedTasks.filter(p => p.id.startsWith('PK-1')).length} Lokasi
                    </h3>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Pendapatan Hari Ini</p>
                    <h3 className="text-xl font-bold text-blue-600">{formatRupiah(totalEarnings.daily)}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Rating</p>
                    <h3 className="text-xl font-bold text-yellow-600 flex items-center gap-1">
                        {driverProfile.rating} <span className="text-xs text-gray-400 font-normal">/ 5.0</span>
                    </h3>
                </div>
            </div>

            {/* Quick List Schedule */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Clock size={20}/> Jadwal Prioritas</h3>
                    <button onClick={()=>setActivePage('pickups')} className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                    {activeTasks.length > 0 ? activeTasks.slice(0, 2).map((pickup) => (
                        <div key={pickup.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPickup(pickup)}>
                            <div className="flex gap-3">
                                <div className={`w-1 self-stretch rounded-full ${pickup.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                <div>
                                    <h4 className="font-bold text-black">{pickup.address}</h4>
                                    <p className="text-sm text-gray-600">{pickup.customer} • {pickup.type}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-400"/>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4">Tidak ada jadwal aktif.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderPickupList = () => {
        // FILTER UPDATED: Sekarang bisa menampilkan 'Selesai' di list ini
        const filtered = pickups.filter(p => {
            if (filterStatus === 'All') return p.status !== 'Selesai' && p.status !== 'Canceled'; // Default behavior
            if (filterStatus === 'Selesai') return p.status === 'Selesai';
            return p.status === filterStatus;
        });
        
        return (
            <div className="space-y-4 text-black">
                {/* Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Pending', 'In Progress', 'Menuju Lokasi', 'Selesai'].map(status => (
                        <button 
                            key={status} 
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-green-600 text-white shadow-md' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filtered.length > 0 ? filtered.map(pickup => (
                        <div key={pickup.id} className="bg-white p-5 rounded-xl border shadow-sm relative transition hover:shadow-md">
                            {pickup.priority === 'High' && pickup.status !== 'Selesai' && <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">PRIORITAS</span>}
                            {pickup.status === 'Selesai' && <span className="absolute top-4 right-4 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10}/> SELESAI</span>}
                            
                            <div className="mb-4">
                                <h4 className="font-bold text-lg text-black">{pickup.address}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><User size={14}/> {pickup.customer} • {pickup.phone}</p>
                            </div>

                            <div className="flex gap-4 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                                <div><p className="text-gray-500 text-xs">Jenis</p><p className="font-medium">{pickup.type}</p></div>
                                <div><p className="text-gray-500 text-xs">{pickup.status === 'Selesai' ? 'Berat Act' : 'Est. Berat'}</p><p className="font-medium">{pickup.status === 'Selesai' ? pickup.actualWeight : pickup.estWeight} kg</p></div>
                                <div><p className="text-gray-500 text-xs">Status</p><p className={`font-bold ${pickup.status === 'Selesai' ? 'text-green-600' : 'text-blue-600'}`}>{pickup.status}</p></div>
                            </div>

                            {/* Tampilkan indikator jika ada bukti foto (untuk status Selesai) */}
                            {pickup.status === 'Selesai' && pickup.proof && (
                                <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                    <ImageIcon size={14}/> Bukti foto terlampir
                                </div>
                            )}

                            <div className="flex gap-2">
                                {pickup.status !== 'Selesai' && (
                                    <button className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 text-black">
                                        <Navigation size={16}/> Rute
                                    </button>
                                )}
                                <button onClick={() => setSelectedPickup(pickup)} className={`flex-1 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 ${pickup.status === 'Selesai' ? 'bg-gray-600' : 'bg-blue-600'}`}>
                                    {pickup.status === 'Selesai' ? 'Lihat Detail' : 'Detail & Aksi'}
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-white rounded-xl border text-gray-500">Tidak ada pickup dengan status ini.</div>
                    )}
                </div>
            </div>
        );
    };

    const renderHistory = () => (
        <div className="space-y-4 text-black">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="font-bold text-lg mb-4">Riwayat Pengangkutan</h3>
                <div className="space-y-4">
                    {completedTasks.length > 0 ? completedTasks.map((h) => (
                        <div key={h.id} className="border-b pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition" onClick={() => setSelectedPickup(h)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-black">{h.address}</p>
                                    <p className="text-xs text-gray-500">{h.date} • {h.actualWeight} kg</p>
                                </div>
                                <p className="font-bold text-green-600">{formatRupiah(h.fee)}</p>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < (h.rating || 0) ? "currentColor" : "none"} className={i >= (h.rating || 0) ? "text-gray-300" : ""}/>)}
                                </div>
                                {h.review ? <p className="text-xs text-gray-600 italic">"{h.review}"</p> : <p className="text-xs text-gray-400 italic">Belum ada ulasan</p>}
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center">Belum ada riwayat selesai.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderEarnings = () => (
        <div className="space-y-6 text-black">
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-green-100 text-sm mb-1">Total Pendapatan Bulan Ini</p>
                    <h2 className="text-3xl font-bold">{formatRupiah(totalEarnings.monthly)}</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border text-center shadow-sm">
                        <p className="text-gray-500 text-xs">Hari Ini</p>
                        <p className="font-bold text-lg text-black">{formatRupiah(totalEarnings.daily)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border text-center shadow-sm">
                        <p className="text-gray-500 text-xs">Minggu Ini (Est)</p>
                        <p className="font-bold text-lg text-black">{formatRupiah(totalEarnings.monthly / 4)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b font-bold">Rincian Transaksi Selesai</div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b">
                        <tr><th className="p-3">Pickup</th><th className="p-3 text-right">Fee</th><th className="p-3 text-right">Status</th></tr>
                    </thead>
                    <tbody>
                        {completedTasks.length > 0 ? completedTasks.map((p) => (
                            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-3">
                                    <p className="font-medium truncate w-32 text-black">{p.address}</p>
                                    <p className="text-xs text-gray-500">{p.date}</p>
                                </td>
                                <td className="p-3 text-right font-medium text-black">{formatRupiah(p.fee)}</td>
                                <td className="p-3 text-right"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Cair</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" className="p-4 text-center text-gray-500">Belum ada transaksi selesai.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500 mb-3">
                    {driverProfile.name.charAt(0)}
                </div>
                <h3 className="font-bold text-xl text-black">{driverProfile.name}</h3>
                <p className="text-sm text-gray-500">{driverProfile.role} • {driverProfile.plateNumber}</p>
                <div className="flex gap-2 mt-4">
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">Verified Driver</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">{driverProfile.vehicleType}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Informasi Pribadi</h4>
                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                        <Edit size={16}/> {isEditingProfile ? 'Batal' : 'Edit'}
                    </button>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                        <input 
                            type="text" 
                            disabled={!isEditingProfile}
                            className={`w-full border rounded-lg p-2 text-sm text-black ${isEditingProfile ? 'bg-white border-blue-400' : 'bg-gray-50 border-gray-200'}`}
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nomor HP</label>
                        <input 
                            type="text" 
                            disabled={!isEditingProfile}
                            className={`w-full border rounded-lg p-2 text-sm text-black ${isEditingProfile ? 'bg-white border-blue-400' : 'bg-gray-50 border-gray-200'}`}
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                    </div>
                    
                    {isEditingProfile && (
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-4 flex items-center justify-center gap-2">
                            <Save size={16}/> Simpan Perubahan
                        </button>
                    )}
                </form>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return renderDashboard();
            case 'pickups': return renderPickupList();
            case 'history': return renderHistory();
            case 'earnings': return renderEarnings();
            case 'profile': return renderProfile();
            default: return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <DashboardLayout
            user={{ name: driverProfile.name, role: driverProfile.role }}
            menuItems={MENUS.driver}
            activePage={activePage}
            setActivePage={setActivePage}
        >
            <div className="mb-6 flex justify-between items-end text-black">
                <div>
                    <h2 className="text-2xl font-bold capitalize">{activePage === 'dashboard' ? 'Dashboard Driver' : activePage.replace('-', ' ')}</h2>
                    <p className="text-sm mt-1">Selamat bekerja, hati-hati di jalan!</p>
                </div>
                <div className="text-sm font-medium bg-gray-100 px-3 py-1 rounded flex items-center gap-2">
                    <Clock size={14}/> {mounted ? currentTime : 'Loading...'}
                </div>
            </div>

            {renderContent()}

            {/* --- MODAL DETAIL PICKUP --- */}
            {selectedPickup && !isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="h-40 bg-gray-200 relative flex items-center justify-center text-gray-500">
                            {selectedPickup.status === 'Selesai' && selectedPickup.proof ? (
                                <img src={selectedPickup.proof} alt="Bukti" className="w-full h-full object-cover"/>
                            ) : (
                                <>
                                    <MapPin size={40} className="mb-2"/>
                                    <span className="text-sm font-medium">Navigasi Map Preview</span>
                                </>
                            )}
                            <button onClick={() => setSelectedPickup(null)} className="absolute top-4 right-4 bg-white p-1 rounded-full shadow"><X size={20} className="text-black"/></button>
                        </div>
                        
                        <div className="p-6 text-black">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl">{selectedPickup.address}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{selectedPickup.customer}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs border font-bold ${getStatusColor(selectedPickup.status)}`}>{selectedPickup.status}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Jenis Sampah</p>
                                    <p className="font-bold">{selectedPickup.type}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">{selectedPickup.status === 'Selesai' ? 'Berat Aktual' : 'Est. Berat'}</p>
                                    <p className="font-bold">{selectedPickup.status === 'Selesai' ? selectedPickup.actualWeight : selectedPickup.estWeight} kg</p>
                                </div>
                            </div>

                            {selectedPickup.notes && (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6 flex gap-2">
                                    <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5"/>
                                    <p className="text-sm text-yellow-800 italic">"{selectedPickup.notes}"</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {selectedPickup.status !== 'Selesai' && (
                                    <>
                                        <button className="flex-1 bg-white border border-gray-300 text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50">
                                            <Phone size={18}/> Hubungi
                                        </button>
                                        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
                                            <Navigation size={18}/> Navigasi
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {selectedPickup.status !== 'Selesai' && (
                                <button onClick={handleOpenUpdate} className="w-full mt-3 bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-md">
                                    <CheckCircle size={18}/> Update Status
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL UPDATE STATUS (DENGAN UPLOAD GAMBAR) --- */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="font-bold text-lg text-black">Update Status Pickup</h3>
                            <button onClick={() => setIsUpdateModalOpen(false)}><X size={20} className="text-black"/></button>
                        </div>
                        
                        <form onSubmit={handleSubmitUpdate} className="space-y-4 text-black">
                            <div>
                                <label className="block text-sm font-bold mb-1">Status Sekarang</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                                    value={updateForm.status}
                                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                                >
                                    <option value="Menuju Lokasi">Menuju Lokasi</option>
                                    <option value="Sampai di Lokasi">Sampai di Lokasi</option>
                                    <option value="Proses Angkut">Proses Angkut</option>
                                    <option value="Selesai">Selesai (Final)</option>
                                </select>
                            </div>

                            {updateForm.status === 'Selesai' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Berat Aktual (kg)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border border-gray-300 rounded-lg p-2 text-black"
                                            value={updateForm.actualWeight}
                                            onChange={(e) => setUpdateForm({...updateForm, actualWeight: e.target.value})}
                                            required
                                        />
                                    </div>
                                    
                                    {/* --- FITUR UPLOAD GAMBAR --- */}
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Bukti Foto</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 relative group">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            
                                            {updateForm.photoPreview ? (
                                                <div className="relative">
                                                    <img src={updateForm.photoPreview} alt="Preview" className="max-h-40 mx-auto rounded shadow-sm"/>
                                                    <p className="text-xs text-green-600 mt-2 font-medium">Klik untuk ganti foto</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera size={24} className="mx-auto text-gray-400 mb-1"/>
                                                    <span className="text-xs text-gray-500">Klik untuk ambil foto bukti</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* --------------------------- */}

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Tanda Tangan Warga</label>
                                        <div 
                                            className={`border rounded-lg p-4 text-center cursor-pointer ${updateForm.isSigned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-300'}`}
                                            onClick={() => setUpdateForm({...updateForm, isSigned: !updateForm.isSigned})}
                                        >
                                            {updateForm.isSigned ? (
                                                <div className="flex flex-col items-center text-green-700">
                                                    <CheckCircle size={24} className="mb-1"/>
                                                    <span className="text-xs font-bold">Sudah Ditandatangani</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-500">
                                                    <PenTool size={24} className="mb-1"/>
                                                    <span className="text-xs">Ketuk untuk Tanda Tangan</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-bold mb-1">Catatan (Opsional)</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-lg p-2 h-20 text-black"
                                    placeholder="Ada kendala di lokasi?"
                                    value={updateForm.note}
                                    onChange={(e) => setUpdateForm({...updateForm, note: e.target.value})}
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2">
                                <Save size={18}/> Simpan Update
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}