'use client';
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic'; 
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Trash2, Calendar, Award, Truck, MapPin, User, FileText, 
  Bell, BookOpen, Clock, X, LogOut, ChevronLeft, ChevronRight, HelpCircle,
  Wallet, CheckCircle2, AlertCircle, Search, PlayCircle, 
  Phone, MessageCircle, Star, ArrowRight, Megaphone, CheckCheck, Trash,
  CreditCard, QrCode, Building, Loader2, Lock, Edit2
} from 'lucide-react';

// Import CSS Leaflet
import 'leaflet/dist/leaflet.css';

// Inisialisasi Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Koordinat Default
const CENTER_COORDS = [-6.9175, 107.6191]; // Titik Tengah Peta
const DRIVER_START = [-6.9250, 107.6250];  // Titik Awal Driver

export default function UserDashboard() {
  const router = useRouter();

  // --- 1. SETUP MAPS ---
  const MapContainer = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
  ), []);
  
  const TileLayer = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
  ), []);
  
  const Marker = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
  ), []);

  const [driverIcon, setDriverIcon] = useState(null);

  useEffect(() => {
    (async () => {
        const L = (await import('leaflet')).default;
        // Hanya membuat Icon Driver (Truk)
        setDriverIcon(new L.Icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3096/3096673.png',
            iconSize: [45, 45],
            iconAnchor: [22, 22],
            popupAnchor: [0, -20]
        }));
    })();
  }, []);

  // --- 2. SETUP MIDTRANS SNAP ---
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY; 
    
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  }, []);

  // --- 3. STATE MANAGEMENT ---
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalWaste: 0, lastPickup: '-', points: 0 });
  const [wasteTypes, setWasteTypes] = useState([]);
  const [pickupHistory, setPickupHistory] = useState([]);
  const [activePickup, setActivePickup] = useState(null);
  const [driverLocation, setDriverLocation] = useState(DRIVER_START);

  const [bills, setBills] = useState([
    { id: 101, title: 'Iuran Kebersihan - Feb 2026', amount: 25000, status: 'Unpaid', due_date: '2026-02-10' },
    { id: 102, title: 'Iuran Kebersihan - Jan 2026', amount: 25000, status: 'Paid', paid_at: '2026-01-12' },
  ]);
  const [paymentModal, setPaymentModal] = useState({ open: false, bill: null, step: 'method' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'Selamat Datang!', message: 'Akun berhasil dibuat.', time: '1 Hari lalu', read: true },
  ]);
  const [formRequest, setFormRequest] = useState({ wasteTypeId: '', weight: '', date: '', time: '', notes: '' });
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isEditProfile, setIsEditProfile] = useState(false);

  // --- 4. DATA STATIS ---
  const SIDEBAR_MENUS = [
    { id: 'dashboard', label: 'Dashboard', icon: Award },
    { id: 'request', label: 'Request Pickup', icon: Truck },
    { id: 'history', label: 'Riwayat', icon: FileText },
    { id: 'iuran', label: 'Bayar Iuran', icon: Wallet },
    { id: 'tracking', label: 'Tracking', icon: MapPin },
    { id: 'edukasi', label: 'Edukasi', icon: BookOpen },
  ];

  const EDUCATION_DATA = [
    { id: 1, type: 'article', category: 'Tips', title: 'Cara Memilah Sampah', desc: 'Panduan dasar.', content: '...', readTime: '3 min' },
    { id: 2, type: 'video', category: 'Tutorial', title: 'Membuat Kompos', desc: 'Video tutorial.', content: 'Video Placeholder', readTime: '5 min' },
    { id: 3, type: 'article', category: 'Info', title: 'Bahaya B3', desc: 'Kenapa baterai berbahaya?', content: '...', readTime: '4 min' },
  ];

  // --- 5. LOGIC & EFFECTS ---
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    fetchData();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activePage === 'tracking' && activePickup) {
      const interval = setInterval(() => {
        setDriverLocation(prev => {
          const latDiff = (CENTER_COORDS[0] - prev[0]) * 0.05;
          const lngDiff = (CENTER_COORDS[1] - prev[1]) * 0.05;
          if(Math.abs(latDiff) < 0.00001 && Math.abs(lngDiff) < 0.00001) return prev;
          return [prev[0] + latDiff, prev[1] + lngDiff];
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
        setDriverLocation(DRIVER_START);
    }
  }, [activePage, activePickup]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      const { data: wastes } = await supabase.from('waste_types').select('*');
      if (wastes) setWasteTypes(wastes);

      const { data: transactions } = await supabase.from('transactions')
        .select('*, waste_types(name, price_per_kg)')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (transactions) {
        const formattedHistory = transactions.map(t => ({
          id: `#REQ-${t.id}`, type: t.waste_types?.name || 'Sampah', weight: t.weight,
          date: new Date(t.created_at).toLocaleDateString('id-ID'),
          time: new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          status: t.status, fee: t.total_price || 0
        }));
        setPickupHistory(formattedHistory);

        const totalW = transactions.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);
        const lastP = transactions.length > 0 ? new Date(transactions[0].created_at).toLocaleDateString('id-ID') : '-';
        setStats({ totalWaste: totalW, lastPickup: lastP, points: Math.floor(totalW * 10) });

        const active = transactions.find(t => t.status === 'Pending' || t.status === 'Process');
        if (active) {
          setActivePickup({
            id: active.id, status: active.status, driver: 'Budi Santoso', 
            vehicle: 'Grand Max Pickup', plate: 'D 1234 ABC', phone: '0812-3456-7890', rating: 4.8, eta: '15 Menit'
          });
        } else { setActivePickup(null); }
      }
    } catch (error) { console.error("Error data:", error); } finally { setLoading(false); }
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = { id: Date.now(), type, title, message, time: 'Baru saja', read: false };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const handleUpdateProfile = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      setProfile({ ...profile, full_name: formData.get('fullName'), email: formData.get('email') });
      setIsEditProfile(false);
      addNotification("Profil Diperbarui", "Data profil berhasil disimpan.", "info");
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    if (!formRequest.wasteTypeId || !formRequest.weight) { alert("Lengkapi data!"); return; }
    try {
      const selectedType = wasteTypes.find(w => w.id === parseInt(formRequest.wasteTypeId));
      const totalEstimated = (selectedType?.price_per_kg || 0) * parseFloat(formRequest.weight);
      const { error } = await supabase.from('transactions').insert({
        profile_id: profile.id, waste_type_id: formRequest.wasteTypeId, weight: formRequest.weight,
        total_price: totalEstimated, status: 'Pending', pickup_time: formRequest.time, notes: formRequest.notes
      });
      if (error) throw error;
      alert("Request Berhasil!");
      addNotification("Request Terkirim", `Request pickup ${selectedType?.name} berhasil dibuat.`, "pickup");
      setFormRequest({ wasteTypeId: '', weight: '', date: '', time: '', notes: '' });
      fetchData(); setActivePage('tracking');
    } catch (err) { alert("Gagal: " + err.message); }
  };

  const handlePayClick = (bill) => { setPaymentModal({ open: true, bill: bill, step: 'method' }); };

  const processPayment = async () => {
    setPaymentModal(prev => ({ ...prev, step: 'processing' }));

    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: paymentModal.bill.id,
                amount: paymentModal.bill.amount,
                title: paymentModal.bill.title,
                firstName: profile?.full_name?.split(' ')[0] || "Warga",
                email: profile?.email || "warga@example.com"
            })
        });

        const data = await response.json();

        if (!data.token) throw new Error("Gagal mendapatkan token transaksi.");

        window.snap.pay(data.token, {
            onSuccess: function(result){
                setBills(prevBills => prevBills.map(b => b.id === paymentModal.bill.id ? { ...b, status: 'Paid', paid_at: new Date().toLocaleDateString('id-ID') } : b));
                addNotification("Pembayaran Sukses", `Tagihan ${paymentModal.bill.title} lunas.`, "payment");
                setPaymentModal(prev => ({ ...prev, step: 'success' }));
                setTimeout(() => { setPaymentModal({ open: false, bill: null, step: 'method' }); }, 2500);
            },
            onPending: function(result){
                alert("Menunggu pembayaran!");
                setPaymentModal({ ...paymentModal, open: false });
            },
            onError: function(result){
                alert("Pembayaran gagal!");
                setPaymentModal({ ...paymentModal, open: false });
            },
            onClose: function(){
                setPaymentModal({ ...paymentModal, open: false });
            }
        });

    } catch (error) {
        console.error("Payment Error:", error);
        alert("Gagal koneksi ke pembayaran.");
        setPaymentModal({ ...paymentModal, open: false });
    }
  };

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const markAsRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotification = (id) => setNotifications(notifications.filter(n => n.id !== id));
  const unreadCount = notifications.filter(n => !n.read).length;
  const getStatusColor = (s) => (s === 'Done' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700');

  // --- RENDERERS ---

  const renderDashboard = () => (
      <div className="space-y-6 animate-in fade-in text-gray-800">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Halo, {profile?.full_name?.split(' ')[0]}! 👋</h2>
              <p>Selamat datang kembali.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[ { l: 'Total Sampah', v: `${stats.totalWaste} kg`, i: Trash2 }, { l: 'Poin', v: stats.points, i: Award }, { l: 'Pickup Terakhir', v: stats.lastPickup, i: Calendar } ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                      <div><p className="text-gray-500 text-sm font-medium">{s.l}</p><h3 className="text-2xl font-bold text-gray-800">{s.v}</h3></div>
                      <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><s.i size={28}/></div>
                  </div>
              ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800">Status Pickup Terbaru</h3>{activePickup ? (<span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(activePickup.status)}`}>{activePickup.status}</span>) : (<span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">Standby</span>)}</div>
              {activePickup ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4"><div className="bg-blue-600 text-white p-3 rounded-lg"><Truck size={24} /></div><div><p className="font-bold text-gray-900 text-lg">{activePickup.status}</p><p className="text-sm text-gray-700">Driver: {activePickup.driver}</p></div></div>
                      <button onClick={() => setActivePage('tracking')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">Lacak</button>
                  </div>
              ) : (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg bg-gray-50"><Truck size={32} className="mx-auto mb-2 opacity-50"/><p>Belum ada request pickup aktif.</p><button onClick={() => setActivePage('request')} className="mt-2 text-green-600 font-bold hover:underline">Buat Request Baru</button></div>
              )}
          </div>
      </div>
  );

  const renderRequest = () => (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-in slide-in-from-right text-gray-800">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800"><Truck/> Form Request</h3>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1 text-gray-600">Jenis Sampah</label><select className="w-full border p-2 rounded bg-white text-gray-800" value={formRequest.wasteTypeId} onChange={e => setFormRequest({...formRequest, wasteTypeId: e.target.value})} required><option value="">Pilih Sampah</option>{wasteTypes.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium mb-1 text-gray-600">Berat (Kg)</label><input type="number" className="w-full border p-2 rounded bg-white text-gray-800" placeholder="0" value={formRequest.weight} onChange={e => setFormRequest({...formRequest, weight: e.target.value})} required/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1 text-gray-600">Tanggal</label><input type="date" className="w-full border p-2 rounded bg-white text-gray-800" value={formRequest.date} onChange={e => setFormRequest({...formRequest, date: e.target.value})} required/></div>
                  <div><label className="block text-sm font-medium mb-1 text-gray-600">Waktu</label><input type="time" className="w-full border p-2 rounded bg-white text-gray-800" value={formRequest.time} onChange={e => setFormRequest({...formRequest, time: e.target.value})} required/></div>
              </div>
              <div><label className="block text-sm font-medium mb-1 text-gray-600">Catatan</label><textarea className="w-full border p-2 rounded h-24 bg-white text-gray-800" placeholder="Lokasi detail..." value={formRequest.notes} onChange={e => setFormRequest({...formRequest, notes: e.target.value})}></textarea></div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Kirim Request</button>
          </form>
      </div>
  );

  const renderTracking = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {activePickup ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-200 rounded-xl h-64 md:h-80 w-full relative overflow-hidden border border-gray-300 shadow-inner z-0">
                <MapContainer center={CENTER_COORDS} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                    {/* HANYA MARKER DRIVER YANG DITAMPILKAN */}
                    {driverIcon && <Marker position={driverLocation} icon={driverIcon} />}
                </MapContainer>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[400] bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
                    <div className="bg-green-600 text-white p-2 rounded-full"><Truck size={20}/></div>
                    <div><p className="text-xs font-bold text-gray-500">Estimasi Tiba</p><p className="font-bold text-green-700">{activePickup.eta}</p></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Status</h3>
                <div className="flex justify-between items-center gap-2">
                    {[{l:'Request',a:true},{l:'Jalan',a:true},{l:'Sampai',a:false},{l:'Selesai',a:false}].map((s,i)=>(
                        <div key={i} className="flex flex-col items-center text-center w-full"><div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-1 ${s.a?'bg-green-600 border-green-600 text-white':'bg-white border-gray-300 text-gray-400'}`}>{s.a?<CheckCheck size={16}/>:i+1}</div><p className="text-xs font-bold text-gray-600">{s.l}</p></div>
                    ))}
                </div>
            </div>
          </div>
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Driver</h3>
                <div className="flex items-center gap-4 mb-6"><div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">BS</div><div><h4 className="font-bold text-gray-800">{activePickup.driver}</h4><div className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor"/><span className="text-sm font-bold text-gray-600">{activePickup.rating}</span></div><p className="text-xs text-gray-500">{activePickup.plate}</p></div></div>
                <div className="grid grid-cols-2 gap-3"><button className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg font-bold"><MessageCircle size={18}/> Chat</button><button className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 rounded-lg font-bold"><Phone size={18}/> Call</button></div>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center"><Truck size={40} className="text-gray-400 opacity-50 mx-auto mb-4"/><h3 className="text-xl font-bold text-gray-800">Tidak Ada Pickup Aktif</h3><button onClick={() => setActivePage('request')} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-bold">Buat Request</button></div>
      )}
    </div>
  );

  const renderIuran = () => (
    <div className="space-y-6 animate-in slide-in-from-right">
       <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6"><div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Wallet size={24} /></div><div><h3 className="text-xl font-bold text-gray-800">Tagihan Iuran</h3><p className="text-sm text-gray-500">Kelola pembayaran.</p></div></div>
          {bills.map(bill => (
             <div key={bill.id} className="border p-4 rounded-xl flex justify-between items-center mb-3 transition hover:bg-gray-50">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600"><Building size={24}/></div>
                    <div><p className="font-bold text-gray-800">{bill.title}</p><p className="text-sm text-gray-500">Status: <span className={bill.status==='Paid'?'text-green-600 font-bold':'text-red-600 font-bold'}>{bill.status}</span></p></div>
                </div>
                {bill.status === 'Unpaid' ? <button onClick={() => handlePayClick(bill)} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition">Bayar</button> : <span className="text-green-600 font-bold flex items-center gap-1"><CheckCheck size={16}/> Lunas</span>}
             </div>
          ))}
       </div>
    </div>
  );

  const renderEdukasi = () => (
    <div className="space-y-6 animate-in slide-in-from-right">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
                {['Semua', 'Tips', 'Tutorial', 'Info'].map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
                ))}
            </div>
            <div className="flex items-center gap-2 w-full md:w-64 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"><Search className="text-gray-400" size={18}/><input type="text" placeholder="Cari artikel..." className="w-full outline-none text-sm bg-transparent text-gray-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EDUCATION_DATA.filter(i => (selectedCategory === 'Semua' || i.category === selectedCategory) && i.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group cursor-pointer" onClick={() => setSelectedArticle(item)}>
                    <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green-50 transition">{item.type==='video'?<PlayCircle size={40} className="group-hover:text-green-600"/>:<BookOpen size={40} className="group-hover:text-green-600"/>}</div>
                    <div className="p-5">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{item.category}</span>
                        <h3 className="font-bold text-lg mt-2 mb-2 text-gray-800 group-hover:text-green-600">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.desc}</p>
                        <button className="text-green-600 font-bold text-sm flex items-center gap-1">Baca <ArrowRight size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderNotifikasi = () => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-right">
          <div className="flex justify-between mb-4"><h3 className="font-bold text-xl text-gray-800">Notifikasi</h3>{unreadCount > 0 && <button onClick={markAllRead} className="text-green-600 text-sm font-bold hover:underline">Tandai dibaca</button>}</div>
          {notifications.map(n => (
              <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 border-b flex gap-4 cursor-pointer hover:bg-gray-50 transition ${!n.read && 'bg-green-50'}`}>
                  <div className={`p-2 rounded-full h-fit ${n.type==='payment'?'bg-green-100 text-green-600':n.type==='pickup'?'bg-blue-100 text-blue-600':'bg-gray-100 text-gray-600'}`}>{n.type==='payment'?<Wallet size={20}/>:n.type==='pickup'?<Truck size={20}/>:<Bell size={20}/>}</div>
                  <div className="flex-1"><div className="flex justify-between"><h4 className={`font-bold text-sm ${n.read ? 'text-gray-600' : 'text-black'}`}>{n.title}</h4><span className="text-xs text-gray-400">{n.time}</span></div><p className="text-sm text-gray-600 mt-1">{n.message}</p></div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="text-gray-400 hover:text-red-500"><Trash size={16}/></button>
              </div>
          ))}
          {notifications.length === 0 && <div className="text-center py-8 text-gray-400">Belum ada notifikasi.</div>}
      </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-in slide-in-from-right">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800"><User/> Profil Saya</h3>
            <button onClick={() => setIsEditProfile(true)} className="text-sm font-bold text-green-600 flex items-center gap-1 hover:underline"><Edit2 size={16}/> Edit</button>
        </div>
        <div className="space-y-4 text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100"><label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label><p className="font-medium text-lg text-gray-900">{profile?.full_name}</p></div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100"><label className="text-xs font-bold text-gray-500 uppercase">Email</label><p className="font-medium text-lg text-gray-900">{profile?.email}</p></div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100"><label className="text-xs font-bold text-gray-500 uppercase">NIK</label><p className="font-medium text-lg text-gray-900">{profile?.nik || '-'}</p></div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100"><label className="text-xs font-bold text-gray-500 uppercase">Alamat</label><p className="font-medium text-lg text-gray-900">{profile?.address}</p></div>
            </div>
            <button onClick={handleLogout} className="w-full mt-6 flex justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100 transition"><LogOut size={20}/> Keluar Aplikasi</button>
        </div>
    </div>
  );

  const renderHistory = () => (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-in slide-in-from-right">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800"><FileText/> Riwayat Transaksi</h3>
          {pickupHistory.length > 0 ? pickupHistory.map((pickup, idx) => (
              <div key={idx} className="border p-4 rounded-xl flex justify-between items-center mb-3 hover:bg-gray-50 cursor-pointer transition" onClick={() => setSelectedHistory(pickup)}>
                  <div className="flex gap-4 items-center">
                      <div className="bg-green-100 p-3 rounded-lg"><Trash2 size={24} className="text-green-600" /></div>
                      <div><p className="font-bold text-gray-800">{pickup.type}</p><p className="text-sm text-gray-500">{pickup.date}</p></div>
                  </div>
                  <p className="font-bold text-lg text-gray-800">Rp {pickup.fee.toLocaleString()}</p>
              </div>
          )) : <div className="text-center py-12 text-gray-400">Belum ada riwayat.</div>}
      </div>
  );

  const renderContent = () => {
      switch (activePage) {
          case 'dashboard': return renderDashboard();
          case 'request': return renderRequest();
          case 'history': return renderHistory();
          case 'iuran': return renderIuran();
          case 'tracking': return renderTracking();
          case 'edukasi': return renderEdukasi();
          case 'profile': return renderProfile();
          case 'notifikasi': return renderNotifikasi();
          default: return <div>Halaman tidak ditemukan</div>;
      }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center text-gray-800 font-bold"><Loader2 className="animate-spin mr-2"/> Memuat Data...</div>;

  return (
      <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
        {/* SIDEBAR */}
        <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 fixed h-full z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
                {isSidebarOpen && (<h1 className="text-2xl font-bold text-green-600 flex items-center gap-2 overflow-hidden"><img src="/images/logo.png" alt="Logo" className="w-auto h-auto object-fill" /> </h1>)}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-lg hover:bg-gray-100 text-gray-500 ${!isSidebarOpen && 'mx-auto'}`}>{isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}</button>
            </div>
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
                {SIDEBAR_MENUS.map(menu => (
                    <button key={menu.id} onClick={() => setActivePage(menu.id)} className={`w-full flex items-center rounded-xl font-medium transition-all duration-200 h-12 ${activePage === menu.id ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'} ${isSidebarOpen ? 'px-4 gap-3 justify-start' : 'justify-center px-0'}`}>
                        <menu.icon size={22} className={`min-w-[22px] ${activePage === menu.id ? 'text-green-600' : 'text-gray-400'}`}/> {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{menu.label}</span>}
                    </button>
                ))}
            </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div><h2 className="text-2xl font-bold capitalize text-gray-800">{activePage === 'dashboard' ? 'Overview' : activePage.replace('-', ' ')}</h2><p className="text-gray-500 text-sm">Pantau aktivitas lingkunganmu.</p></div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex text-sm font-medium text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 items-center gap-2 shadow-sm"><Clock size={16}/> {mounted ? currentTime : '...'}</div>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                            <button onClick={() => setActivePage('notifikasi')} className="p-2 rounded-lg hover:bg-gray-100 relative text-gray-600"><Bell size={20}/>{unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}</button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button onClick={() => setActivePage('profile')} className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-lg hover:bg-gray-50"><div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">{profile?.full_name?.charAt(0) || 'U'}</div></button>
                        </div>
                    </div>
                </header>
                {renderContent()}
            </div>
        </main>

        {/* --- MODAL EDIT PROFILE --- */}
        {isEditProfile && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Edit Profil</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div><label className="block text-sm font-bold text-gray-600 mb-1">Nama Lengkap</label><input name="fullName" defaultValue={profile?.full_name} className="w-full border p-2 rounded text-gray-800"/></div>
                        <div><label className="block text-sm font-bold text-gray-600 mb-1">Email</label><input name="email" defaultValue={profile?.email} className="w-full border p-2 rounded text-gray-800"/></div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsEditProfile(false)} className="flex-1 py-2 border rounded font-bold text-gray-600">Batal</button>
                            <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- MODAL DETAIL HISTORY & EDUKASI --- */}
        {(selectedHistory || selectedArticle) && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className={`bg-white rounded-xl p-6 w-full shadow-2xl overflow-y-auto max-h-[90vh] ${selectedArticle ? 'max-w-2xl' : 'max-w-sm'}`}>
                      <div className="flex justify-between mb-4 border-b pb-4">
                          <h3 className="font-bold text-lg text-gray-800">{selectedArticle ? selectedArticle.title : 'Detail Transaksi'}</h3>
                          <button onClick={() => {setSelectedHistory(null); setSelectedArticle(null)}}><X size={20} className="text-black hover:text-red-500"/></button>
                      </div>
                      {selectedHistory && (<div className="space-y-3 text-sm text-black"><div className="flex justify-between border-b pb-2"><span>ID</span><span className="font-bold">{selectedHistory.id}</span></div><div className="flex justify-between items-center pt-2"><span>Total</span><span className="font-bold text-lg text-blue-600">Rp {selectedHistory.fee.toLocaleString()}</span></div></div>)}
                      {selectedArticle && (<div className="space-y-4 text-black"><div className="w-full h-48 bg-gray-100 flex items-center justify-center">{selectedArticle.type==='video'?<PlayCircle size={48}/>:<BookOpen size={48}/>}</div><div className="flex gap-2 mt-2"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{selectedArticle.category}</span></div><p className="text-gray-700 mt-2">{selectedArticle.desc}</p></div>)}
                      <button onClick={() => {setSelectedHistory(null); setSelectedArticle(null)}} className="w-full mt-6 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200 text-black">Tutup</button>
                  </div>
              </div>
        )}

        {/* --- MODAL PAYMENT --- */}
        {paymentModal.open && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in zoom-in">
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center text-black">
                        <div className="flex items-center gap-2"><Wallet size={20} className="text-green-600"/><span className="font-bold text-gray-800">Pembayaran</span></div>
                        <button onClick={() => setPaymentModal({ ...paymentModal, open: false })} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <div className="p-6 text-black">
                        {paymentModal.step === 'method' && (
                            <div className="space-y-4">
                                <div className="text-center mb-6"><p className="text-gray-500 text-sm">Total Tagihan</p><h2 className="text-3xl font-bold mt-1 text-gray-800">Rp {paymentModal.bill.amount.toLocaleString()}</h2></div>
                                {/* Tombol Bayar Sekarang (Single Button) */}
                                <button 
                                    onClick={processPayment} 
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                                >
                                    Bayar Sekarang (Midtrans)
                                </button>
                            </div>
                        )}
                        {paymentModal.step === 'processing' && <div className="py-12 text-center"><Loader2 size={48} className="animate-spin text-green-600 mx-auto mb-4"/><h3 className="font-bold text-gray-800">Memproses Transaksi...</h3></div>}
                        {paymentModal.step === 'success' && <div className="py-8 text-center"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCheck size={40} className="text-green-600"/></div><h3 className="text-2xl font-bold text-gray-800">Pembayaran Berhasil!</h3></div>}
                    </div>
                </div>
            </div>
        )}
      </div>
  );
}