
"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
    Search, 
    Download, 
    Trash2, 
    Eye, 
    FileImage, 
    Calendar, 
    RefreshCw,
    GraduationCap,
    Clock,
    Layers,
    ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface GalleryItem {
    filename: string;
    filepath: string;
    prodi: string;
    year: string;
    month: string;
    createdAt: string;
    size: number;
}

export default function GalleryPage() {
    const [files, setFiles] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProdi, setSelectedProdi] = useState("Semua");
    const [selectedYear, setSelectedYear] = useState("Semua");
    const [selectedMonth, setSelectedMonth] = useState("Semua");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [isZipping, setIsZipping] = useState(false);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/gallery");
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
                setLastUpdated(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error("Gagal mengambil data galeri:", error);
            toast.error("Gagal memuat galeri");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadZip = async () => {
        if (filteredFiles.length === 0) {
            toast.error("Tidak ada file untuk diunduh");
            return;
        }

        setIsZipping(true);
        try {
            const res = await fetch("/api/gallery/download-zip", {
                method: "POST",
                body: JSON.stringify({ files: filteredFiles }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `IDCards_${selectedProdi.replace(/\s+/g, "_")}_${selectedYear}_${selectedMonth}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success("File ZIP berhasil dibuat!");
            } else {
                toast.error("Gagal membuat file ZIP");
            }
        } catch (error) {
            console.error("ZIP Error:", error);
            toast.error("Terjadi kesalahan saat membuat ZIP");
        } finally {
            setIsZipping(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Get unique values for filters
    const prodiList = ["Semua", ...Array.from(new Set(files.map(f => f.prodi)))];
    const yearList = ["Semua", ...Array.from(new Set(files.map(f => f.year)))].sort().reverse();
    const monthList = ["Semua", ...Array.from(new Set(files.map(f => f.month)))].sort();

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProdi = selectedProdi === "Semua" || file.prodi === selectedProdi;
        const matchesYear = selectedYear === "Semua" || file.year === selectedYear;
        const matchesMonth = selectedMonth === "Semua" || file.month === selectedMonth;
        return matchesSearch && matchesProdi && matchesYear && matchesMonth;
    });

    const handleDelete = async (filepath: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus file ini?")) return;

        try {
            const res = await fetch("/api/gallery", {
                method: "DELETE",
                body: JSON.stringify({ filepath }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            if (data.success) {
                toast.success("File berhasil dihapus");
                fetchFiles();
            } else {
                toast.error(data.error || "Gagal menghapus file");
            }
        } catch (error) {
            console.error("Gagal menghapus:", error);
            toast.error("Terjadi kesalahan");
        }
    };

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const monthNames: Record<string, string> = {
        "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
        "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
        "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
            <div className="container mx-auto max-w-7xl px-4 pb-20">
                <AppHeader />

                {/* Header & Stats */}
                <div className="mt-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">File Manager</h1>
                            <div className="flex items-center gap-2 text-zinc-500 mt-1">
                                <Layers className="h-4 w-4" />
                                <span>{files.length} Total ID Cards</span>
                                <span className="mx-2">•</span>
                                <Clock className="h-4 w-4" />
                                <span>Terakhir diupdate: {lastUpdated || "--:--"}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/">
                                <Button variant="outline" className="rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-all">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Dashboard
                                </Button>
                            </Link>
                            <Button 
                                onClick={handleDownloadZip} 
                                variant="default" 
                                disabled={isZipping || filteredFiles.length === 0}
                                className="rounded-full bg-zinc-900 shadow-lg hover:bg-black transition-all"
                            >
                                {isZipping ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Download ZIP ({filteredFiles.length})
                            </Button>
                            <Button onClick={fetchFiles} variant="outline" className="rounded-full bg-white shadow-sm">
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                        <CardContent className="p-6 space-y-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                <Input 
                                    placeholder="Cari NIM atau Nama Mahasiswa..." 
                                    className="pl-12 h-14 text-lg rounded-2xl border-zinc-100 bg-zinc-50/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2">Tahun:</span>
                                    {yearList.map(y => (
                                        <Button
                                            key={y}
                                            variant={selectedYear === y ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => setSelectedYear(y)}
                                            className="rounded-full px-4"
                                        >
                                            {y}
                                        </Button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2">Bulan:</span>
                                    {monthList.map(m => (
                                        <Button
                                            key={m}
                                            variant={selectedMonth === m ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => setSelectedMonth(m)}
                                            className="rounded-full px-4"
                                        >
                                            {m === "Semua" ? "Semua" : monthNames[m] || m}
                                        </Button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2">Prodi:</span>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 scrollbar-hide">
                                        {prodiList.map(p => (
                                            <Button
                                                key={p}
                                                variant={selectedProdi === p ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedProdi(p)}
                                                className="rounded-full px-4 border-zinc-200"
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Grid Section */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[3/4] rounded-3xl bg-white border border-zinc-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredFiles.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredFiles.map((file, idx) => (
                                <motion.div
                                    key={file.filename}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                >
                                    <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white">
                                        <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                                            <img 
                                                src={file.filepath} 
                                                alt={file.filename}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button size="icon" variant="secondary" className="rounded-full" onClick={() => setPreviewImage(file.filepath)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="secondary" className="rounded-full" onClick={() => handleDownload(file.filepath, file.filename)}>
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="destructive" className="rounded-full" onClick={() => handleDelete(file.filepath)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute top-4 left-4">
                                                <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight text-zinc-600 shadow-sm">
                                                    {file.year} • {monthNames[file.month] || file.month}
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
                                                <GraduationCap className="h-3 w-3" />
                                                <span className="truncate">{file.prodi}</span>
                                            </div>
                                            <h4 className="font-bold text-zinc-800 truncate">{file.filename.replace(".png", "").replace(/_/g, " ")}</h4>
                                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(file.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                                <span>{(file.size / 1024).toFixed(0)} KB</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="bg-white p-10 rounded-full shadow-sm mb-6">
                            <FileImage className="h-16 w-16 text-zinc-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-800">Tidak ada file</h3>
                        <p className="text-zinc-500 max-w-xs">Gunakan filter lain atau buat ID Card baru untuk melihat hasil di sini.</p>
                    </div>
                )}
            </div>

            {/* Lightbox Preview */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.img 
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            src={previewImage} className="max-h-[85vh] rounded-2xl shadow-2xl border-4 border-white/10"
                            alt="Preview"
                        />
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
