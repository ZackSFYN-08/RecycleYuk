import {
    LayoutDashboard, Users, Truck, Package, MapPin, FileText,
    DollarSign, Settings, Home, List, History, User, BookOpen,
    Bell, MessageSquare, Calendar
} from 'lucide-react';

export const MENUS = {
    admin: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Manajemen User', icon: Users },
        { id: 'drivers', label: 'Manajemen Driver', icon: Truck },
        { id: 'pickups', label: 'Manajemen Pengangkutan', icon: Package },
        { id: 'areas', label: 'Manajemen Wilayah', icon: MapPin },
        { id: 'reports', label: 'Laporan & Analitik', icon: FileText },
        { id: 'finance', label: 'Keuangan', icon: DollarSign },
        { id: 'settings', label: 'Pengaturan', icon: Settings }
    ],
    driver: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'pickups', label: 'Daftar Pickup', icon: List },
        { id: 'history', label: 'Histori', icon: History },
        { id: 'earnings', label: 'Pendapatan', icon: DollarSign },
        { id: 'profile', label: 'Profil Saya', icon: User },
    ],
    kepala: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'monitoring', label: 'Monitoring', icon: MapPin },
        { id: 'warga', label: 'Data Warga', icon: Users },
        { id: 'laporan', label: 'Laporan', icon: Calendar },
        { id: 'pengaduan', label: 'Pengaduan', icon: MessageSquare }
    ],
    warga: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'request', label: 'Request Pickup', icon: Package },
        { id: 'history', label: 'Riwayat', icon: History },
        { id: 'tracking', label: 'Tracking', icon: MapPin },
        { id: 'edukasi', label: 'Edukasi', icon: BookOpen },
        { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
        { id: 'profile', label: 'Profil Saya', icon: User },
    ]
};