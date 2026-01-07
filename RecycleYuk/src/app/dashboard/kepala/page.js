"use client";

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { MENUS } from '@/config/dashboardMenus';
import {
    BarChart3, Users, Trash2, TrendingUp, Calendar, MapPin,
    Search, Download, MessageSquare, AlertCircle,
    CheckCircle, X, Truck, Eye, FileText, Send, Star, Map, Filter
} from 'lucide-react';

export default function KepalaDashboard() {
    const [activePage, setActivePage] = useState('dashboard');

    // --- STATES ---
    const [pickupFilterStatus, setPickupFilterStatus] = useState('all');
    const [pickupFilterDate, setPickupFilterDate] = useState('');
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [isTrackingOpen, setIsTrackingOpen] = useState(false); 
    const [wargaSearchQuery, setWargaSearchQuery] = useState('');
    const [selectedWarga, setSelectedWarga] = useState(null); 
    const [selectedComplaint, setSelectedComplaint] = useState(null); 

    // --- STATE BARU: FILTER LAPORAN ---
    const [reportFilterType, setReportFilterType] = useState('monthly'); // daily, monthly, yearly, custom
    const [reportFilter, setReportFilter] = useState({
        date: new Date().toISOString().split('T')[0], // Default hari ini
        month: new Date().getMonth() + 1, // Default bulan ini (1-12)
        year: new Date().getFullYear(), // Default tahun ini
        startDate: '', // Untuk custom range
        endDate: '',   // Untuk custom range
        region: 'All'
    });

    // --- MOCK DATA ---
    const stats = { totalWaste: 2456, activeUsers: 342, totalPickups: 156, monthlyGrowth: 12, cleanlinessScore: 88 };
    const monthlyData = [{ month: 'Jul', value: 180 }, { month: 'Agu', value: 220 }, { month: 'Sep', value: 195 }, { month: 'Okt', value: 250 }, { month: 'Nov', value: 280 }, { month: 'Des', value: 342 }];

    const pickups = [
        { id: 'PU-001', name: 'Ibu Siti Aminah', address: 'Jl. Mawar No.5, RW 05', date: '2024-12-20', weight: 12, status: 'selesai', driver: 'Budi Santoso', lat: -6.9, lng: 107.6 },
        { id: 'PU-002', name: 'Bapak Joko', address: 'Jl. Melati No.8, RW 05', date: '2024-12-20', weight: 8, status: 'proses', driver: 'Ahmad Fauzi', lat: -6.91, lng: 107.61 },
        { id: 'PU-003', name: 'Pos Kamling', address: 'Jl. Utama RW 05', date: '2024-12-19', weight: 25, status: 'menunggu', driver: '-', lat: null, lng: null },
    ];

    const warga = [
        { id: 'W-001', name: 'Siti Aminah', address: 'Jl. Mawar No.5', phone: '081234567890', status: 'aktif', totalPickup: 12, history: [{ date: '2024-12-20', weight: '12kg', type: 'Organik', status: 'Selesai' }] },
        { id: 'W-002', name: 'Joko Widodo', address: 'Jl. Melati No.8', phone: '081234567891', status: 'aktif', totalPickup: 8, history: [{ date: '2024-12-18', weight: '5kg', type: 'Campur', status: 'Selesai' }] },
    ];

    const complaints = [
        { id: 'CP-01', user: 'Bapak Hartono', date: '2024-12-21', subject: 'Pengangkutan Terlambat', content: 'Sampah di depan rumah belum diangkut sudah 2 hari.', status: 'Pending' },
        { id: 'CP-02', user: 'Ibu Rina', date: '2024-12-18', subject: 'Truk Bau', content: 'Truk pengangkut meneteskan air bau di jalan.', status: 'Resolved' },
    ];

    // Data Laporan (Mock Data lebih detail agar filter bekerja)
    const reportData = [
        { id: 'RPT-001', date: '2024-12-25', region: 'Cibeber', totalWeight: 150, tripCount: 5, status: 'Optimal' },
        { id: 'RPT-002', date: '2024-12-24', region: 'Leuwigajah', totalWeight: 120, tripCount: 4, status: 'Normal' },
        { id: 'RPT-003', date: '2024-12-20', region: 'Cibeber', totalWeight: 200, tripCount: 8, status: 'Overload' },
        { id: 'RPT-004', date: '2024-12-15', region: 'Cimahi Utara', totalWeight: 90, tripCount: 3, status: 'Normal' },
        { id: 'RPT-005', date: '2024-11-30', region: 'Leuwigajah', totalWeight: 180, tripCount: 6, status: 'Optimal' },
        { id: 'RPT-006', date: '2024-10-15', region: 'Cibeber', totalWeight: 110, tripCount: 4, status: 'Normal' },
    ];

    // --- LOGIC HELPERS ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'selesai': case 'Resolved': case 'Optimal': return 'bg-green-100 text-green-800 border-green-200';
            case 'proses': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'menunggu': case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'aktif': return 'bg-green-100 text-green-800';
            case 'non-aktif': case 'Overload': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-black border-gray-200';
        }
    };

    const handleExportExcel = (data, filename) => {
        if (!data || data.length === 0) return alert("Data kosong!");
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(obj => Object.values(obj).join(","));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    // --- RENDER FUNCTIONS (TABS) ---

    const renderDashboard = () => (
        <div className="space-y-6 text-black">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sampah', val: `${stats.totalWaste} kg`, icon: Trash2, col: 'blue' },
                    { label: 'Warga Aktif', val: stats.activeUsers, icon: Users, col: 'purple' },
                    { label: 'Pengangkutan', val: stats.totalPickups, icon: Truck, col: 'green' },
                    { label: 'Indeks Kebersihan', val: `${stats.cleanlinessScore}/100`, icon: Star, col: 'orange' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex justify-between items-center">
                        <div>
                            <p className="text-black text-sm font-medium">{item.label}</p>
                            <h3 className="text-2xl font-bold mt-1 text-black">{item.val}</h3>
                        </div>
                        <div className={`bg-${item.col}-100 p-3 rounded-lg text-${item.col}-700`}>
                            <item.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Grafik Pengangkutan Bulanan</h3>
                <div className="flex items-end justify-between h-64 gap-4 px-2">
                    {monthlyData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                            <div className="w-full bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-all relative" style={{ height: `${(data.value / 350) * 100}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    {data.value} kg
                                </div>
                            </div>
                            <p className="text-sm text-black mt-3 font-medium">{data.month}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMonitoring = () => {
        const filtered = pickups.filter(p => 
            (pickupFilterStatus === 'all' || p.status === pickupFilterStatus) &&
            (pickupFilterDate === '' || p.date === pickupFilterDate)
        );
        return (
            <div className="space-y-6 text-black">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                        <h3 className="text-lg font-bold text-black">Monitoring Wilayah</h3>
                        <div className="flex gap-2">
                            <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-black bg-white" value={pickupFilterDate} onChange={(e) => setPickupFilterDate(e.target.value)}/>
                            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-black bg-white" value={pickupFilterStatus} onChange={(e) => setPickupFilterStatus(e.target.value)}>
                                <option value="all">Semua Status</option><option value="selesai">Selesai</option><option value="proses">Dalam Proses</option><option value="menunggu">Menunggu</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b">
                                <tr><th className="px-4 py-3 text-sm font-bold text-black">ID</th><th className="px-4 py-3 text-sm font-bold text-black">Lokasi / Warga</th><th className="px-4 py-3 text-sm font-bold text-black">Driver</th><th className="px-4 py-3 text-sm font-bold text-black">Status</th><th className="px-4 py-3 text-sm font-bold text-black">Aksi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-sm text-black">{p.id}</td>
                                        <td className="px-4 py-3 text-sm text-black"><div className="font-bold">{p.name}</div><div className="text-xs text-black">{p.address}</div><div className="text-xs text-black font-medium">{p.date} • {p.weight} kg</div></td>
                                        <td className="px-4 py-3 text-sm text-black font-medium">{p.driver}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(p.status)}`}>{p.status}</span></td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button onClick={() => setSelectedPickup(p)} className="text-blue-700 bg-blue-50 p-2 rounded hover:bg-blue-100" title="Detail"><Eye size={16}/></button>
                                            {p.status === 'proses' && <button onClick={() => setIsTrackingOpen(true)} className="text-green-700 bg-green-50 p-2 rounded hover:bg-green-100" title="Track Driver"><Map size={16}/></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderWarga = () => {
        const filtered = warga.filter(w => w.name.toLowerCase().includes(wargaSearchQuery.toLowerCase()));
        return (
            <div className="space-y-6 text-black">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-black">Data Warga RW 05</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-black" size={18} />
                            <input type="text" placeholder="Cari nama warga..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={wargaSearchQuery} onChange={(e) => setWargaSearchQuery(e.target.value)}/>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr><th className="px-4 py-3 text-sm font-bold text-black">Nama</th><th className="px-4 py-3 text-sm font-bold text-black">Alamat</th><th className="px-4 py-3 text-sm font-bold text-black">Total Sampah</th><th className="px-4 py-3 text-sm font-bold text-black">Status</th><th className="px-4 py-3 text-sm font-bold text-black">Aksi</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map((w) => (
                                <tr key={w.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-bold text-black">{w.name}</td>
                                    <td className="px-4 py-3 text-sm text-black">{w.address}</td>
                                    <td className="px-4 py-3 text-sm text-black">{w.totalPickup}x Pickup</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(w.status)}`}>{w.status}</span></td>
                                    <td className="px-4 py-3"><button onClick={() => setSelectedWarga(w)} className="text-blue-700 bg-blue-50 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100">Lihat Histori</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderLaporan = () => {
        // --- LOGIKA FILTER LANJUTAN ---
        const filteredReports = reportData.filter(item => {
            const itemDate = new Date(item.date);
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth() + 1;

            // 1. Filter Wilayah
            if (reportFilter.region !== 'All' && item.region !== reportFilter.region) {
                return false;
            }

            // 2. Filter Berdasarkan Tipe Waktu
            switch (reportFilterType) {
                case 'daily':
                    // Cocokkan tanggal persis (String comparison YYYY-MM-DD)
                    return item.date === reportFilter.date;
                
                case 'monthly':
                    // Cocokkan Bulan dan Tahun
                    return itemMonth === parseInt(reportFilter.month) && itemYear === parseInt(reportFilter.year);
                
                case 'yearly':
                    // Cocokkan Tahun Saja
                    return itemYear === parseInt(reportFilter.year);
                
                case 'custom':
                    // Cocokkan Rentang Tanggal (Start <= Date <= End)
                    if (!reportFilter.startDate || !reportFilter.endDate) return true; // Show all if dates not selected
                    return item.date >= reportFilter.startDate && item.date <= reportFilter.endDate;
                
                default:
                    return true;
            }
        });

        const uniqueRegions = ['All', ...new Set(reportData.map(r => r.region))];

        return (
            <div className="space-y-6 text-black">
                {/* --- HEADER & FILTER --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-black">Laporan & Analitik Wilayah</h3>
                            <p className="text-sm text-black">Filter data berdasarkan periode dan wilayah.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 text-black font-medium" onClick={() => handleExportExcel(filteredReports, `Laporan_${reportFilterType}`)}>
                                <FileText size={16} /> Excel
                            </button>
                            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-bold" onClick={handleExportPDF}>
                                <Download size={16} /> PDF
                            </button>
                        </div>
                    </div>

                    {/* --- FILTER CONTROLS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* 1. Pilih Tipe Filter */}
                        <div>
                            <label className="block text-xs font-bold text-black mb-1">Tipe Laporan</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black bg-white"
                                value={reportFilterType}
                                onChange={(e) => setReportFilterType(e.target.value)}
                            >
                                <option value="daily">Harian (Spesifik)</option>
                                <option value="monthly">Bulanan (1 Bulan Full)</option>
                                <option value="yearly">Tahunan</option>
                                <option value="custom">Rentang Tanggal (Custom)</option>
                            </select>
                        </div>

                        {/* 2. Input Dinamis Berdasarkan Tipe */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-black mb-1">Pilih Periode</label>
                            <div className="flex gap-2">
                                {reportFilterType === 'daily' && (
                                    <input type="date" className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black bg-white" value={reportFilter.date} onChange={(e) => setReportFilter({...reportFilter, date: e.target.value})} />
                                )}

                                {reportFilterType === 'monthly' && (
                                    <>
                                        <select className="w-1/2 border border-gray-300 rounded-lg p-2 text-sm text-black bg-white" value={reportFilter.month} onChange={(e) => setReportFilter({...reportFilter, month: e.target.value})}>
                                            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>)}
                                        </select>
                                        <input type="number" className="w-1/2 border border-gray-300 rounded-lg p-2 text-sm text-black bg-white" placeholder="Tahun" value={reportFilter.year} onChange={(e) => setReportFilter({...reportFilter, year: e.target.value})} />
                                    </>
                                )}

                                {reportFilterType === 'yearly' && (
                                    <input type="number" className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black bg-white" placeholder="Masukkan Tahun (ex: 2024)" value={reportFilter.year} onChange={(e) => setReportFilter({...reportFilter, year: e.target.value})} />
                                )}

                                {reportFilterType === 'custom' && (
                                    <div className="flex items-center gap-2 w-full">
                                        <input type="date" className="w-1/2 border border-gray-300 rounded-lg p-2 text-sm text-black bg-white" value={reportFilter.startDate} onChange={(e) => setReportFilter({...reportFilter, startDate: e.target.value})} title="Tanggal Mulai" />
                                        <span className="text-black">-</span>
                                        <input type="date" className="w-1/2 border border-gray-300 rounded-lg p-2 text-sm text-black bg-white" value={reportFilter.endDate} onChange={(e) => setReportFilter({...reportFilter, endDate: e.target.value})} title="Tanggal Selesai" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Filter Wilayah */}
                        <div>
                            <label className="block text-xs font-bold text-black mb-1">Filter Wilayah</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black bg-white"
                                value={reportFilter.region}
                                onChange={(e) => setReportFilter({...reportFilter, region: e.target.value})}
                            >
                                {uniqueRegions.map((region, idx) => (
                                    <option key={idx} value={region}>{region === 'All' ? 'Semua Wilayah' : region}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- HASIL FILTER (TABEL) --- */}
                <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-100 border-b font-bold text-black flex justify-between items-center">
                        <span>Hasil Laporan</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {filteredReports.length} Data Ditemukan
                        </span>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b bg-white">
                                <th className="p-4 text-black">Tanggal</th>
                                <th className="p-4 text-black">Wilayah</th>
                                <th className="p-4 text-black">Total Berat (kg)</th>
                                <th className="p-4 text-black">Jumlah Trip</th>
                                <th className="p-4 text-black">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length > 0 ? (
                                filteredReports.map((r, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-black">{r.date}</td>
                                        <td className="p-4 font-bold text-black">{r.region}</td>
                                        <td className="p-4 text-black">{r.totalWeight}</td>
                                        <td className="p-4 text-black">{r.tripCount}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(r.status)}`}>{r.status}</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-black font-medium">Tidak ada data yang sesuai dengan filter yang dipilih.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderPengaduan = () => (
        <div className="space-y-6 text-black">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-black">Pengaduan Warga</h3>
                <div className="space-y-4">
                    {complaints.map((c) => (
                        <div key={c.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-black">{c.subject}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getStatusColor(c.status)}`}>{c.status}</span>
                                    </div>
                                    <p className="text-xs text-black font-medium">{c.user} • {c.date}</p>
                                </div>
                                <button onClick={() => setSelectedComplaint(c)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 hover:bg-blue-700 font-bold"><Send size={12}/> Feedback</button>
                            </div>
                            <p className="text-sm text-black bg-gray-50 p-3 rounded-lg border border-gray-100">"{c.content}"</p>
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
            case 'monitoring': return renderMonitoring();
            case 'warga': return renderWarga();
            case 'laporan': return renderLaporan();
            case 'pengaduan': return renderPengaduan();
            default: return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <DashboardLayout
            user={{ name: 'Bapak Sutrisno', role: 'Ketua RW 05' }}
            menuItems={MENUS.kepala}
            activePage={activePage}
            setActivePage={setActivePage}
        >
            <div className="text-black">
                {renderContent()}
            </div>

            {/* --- MODALS (PICKUP, TRACKING, WARGA, COMPLAINT) DILETAKKAN DISINI SAMA SEPERTI SEBELUMNYA --- */}
            {selectedPickup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between mb-4 border-b pb-4"><h3 className="font-bold text-lg text-black">Detail Pengangkutan</h3><button onClick={() => setSelectedPickup(null)}><X size={20} className="text-black hover:text-red-500" /></button></div>
                        <div className="space-y-3 text-sm text-black">
                            <div className="grid grid-cols-3"><span className="text-black font-medium">ID</span><span className="col-span-2 font-bold">{selectedPickup.id}</span></div>
                            <div className="grid grid-cols-3"><span className="text-black font-medium">Nama</span><span className="col-span-2 font-bold">{selectedPickup.name}</span></div>
                            <div className="grid grid-cols-3"><span className="text-black font-medium">Alamat</span><span className="col-span-2">{selectedPickup.address}</span></div>
                            <div className="grid grid-cols-3"><span className="text-black font-medium">Berat</span><span className="col-span-2 font-bold">{selectedPickup.weight} kg</span></div>
                            <div className="grid grid-cols-3"><span className="text-black font-medium">Driver</span><span className="col-span-2">{selectedPickup.driver}</span></div>
                            <div className="grid grid-cols-3"><span className="text-black font-medium">Status</span><div className="col-span-2"><span className={`px-2 py-0.5 rounded text-xs border font-bold ${getStatusColor(selectedPickup.status)}`}>{selectedPickup.status}</span></div></div>
                        </div>
                    </div>
                </div>
            )}
            {isTrackingOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-0 max-w-2xl w-full shadow-2xl overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b bg-gray-100"><h3 className="font-bold text-lg flex items-center gap-2 text-black"><MapPin className="text-red-600"/> Tracking Driver Real-time</h3><button onClick={() => setIsTrackingOpen(false)}><X size={20} className="text-black"/></button></div>
                        <div className="h-80 bg-gray-200 flex flex-col items-center justify-center text-black relative"><Map size={64} className="opacity-20 mb-2 text-black"/><p className="font-bold text-black">Simulasi Peta Wilayah RW 05</p><div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div></div>
                        <div className="p-4 bg-white text-sm flex justify-between items-center border-t border-gray-200"><div className="text-black"><p className="font-bold">Driver: Ahmad Fauzi</p><p className="text-black font-medium">Estimasi sampai: 5 Menit</p></div><button onClick={() => setIsTrackingOpen(false)} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 font-bold">Tutup</button></div>
                    </div>
                </div>
            )}
            {selectedWarga && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-2xl">
                        <div className="flex justify-between mb-4 border-b pb-4"><div><h3 className="font-bold text-lg text-black">Histori Pengangkutan</h3><p className="text-sm text-black font-medium">Warga: {selectedWarga.name}</p></div><button onClick={() => setSelectedWarga(null)}><X size={20} className="text-black"/></button></div>
                        {selectedWarga.history.length > 0 ? (<table className="w-full text-left text-sm text-black"><thead className="bg-gray-100"><tr><th className="p-2 font-bold text-black">Tanggal</th><th className="p-2 font-bold text-black">Berat</th><th className="p-2 font-bold text-black">Jenis</th><th className="p-2 font-bold text-black">Status</th></tr></thead><tbody>{selectedWarga.history.map((h, i) => (<tr key={i} className="border-b"><td className="p-2 text-black">{h.date}</td><td className="p-2 font-bold text-black">{h.weight}</td><td className="p-2 text-black">{h.type}</td><td className="p-2"><span className="text-green-700 text-xs font-bold">{h.status}</span></td></tr>))}</tbody></table>) : (<p className="text-center py-6 text-black font-medium">Belum ada riwayat pengangkutan.</p>)}
                    </div>
                </div>
            )}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between mb-4 border-b pb-4"><h3 className="font-bold text-lg text-black">Kirim Feedback ke Admin</h3><button onClick={() => setSelectedComplaint(null)}><X size={20} className="text-black"/></button></div>
                        <div className="bg-gray-100 p-3 rounded mb-4 text-sm border border-gray-200"><p className="font-bold text-black">Komplain Asal:</p><p className="italic text-black">"{selectedComplaint.content}"</p></div>
                        <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white" placeholder="Tulis pesan/catatan untuk admin pusat terkait komplain ini..."></textarea>
                        <div className="mt-4 flex justify-end gap-2"><button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 border border-gray-300 rounded text-black font-medium hover:bg-gray-50">Batal</button><button onClick={() => { alert('Feedback terkirim ke Admin!'); setSelectedComplaint(null); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 font-bold"><Send size={14}/> Kirim Feedback</button></div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}