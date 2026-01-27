
"use client";


import AppHeader from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";

import { FileImage } from "lucide-react";
import Link from "next/link";
import Background from "@/components/ui/background";

interface GalleryItem {
    filename: string;
    filepath: string;
    prodi: string;
    createdAt: string;
    size: number;
}

export default function GalleryPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto max-w-7xl px-4">
                <AppHeader />

                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                    <div className="bg-zinc-100 p-8 rounded-full border border-dashed border-zinc-300">
                        <FileImage className="h-20 w-20 text-zinc-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold text-zinc-800">File Manager</h2>
                        <h3 className="text-2xl font-medium text-zinc-500">Coming Soon</h3>
                    </div>
                    <p className="text-zinc-500 max-w-md">
                        Fitur manajemen file ID Card dengan integrasi database sedang kami persiapkan untuk rilis selanjutnya.
                    </p>

                    <Link href="/">
                        <Button size="lg" className="mt-4">Kembali ke Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
