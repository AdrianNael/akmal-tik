
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        // Path ke folder uploads/idcards di root project
        // Asumsi server menyimpan di folder 'uploads/idcards' sejajar dengan folder app atau di dalam root folder
        const uploadsDir = path.join(process.cwd(), "uploads", "idcards");

        if (!fs.existsSync(uploadsDir)) {
            return NextResponse.json({ success: true, files: [] });
        }

        const files: any[] = [];

        // Baca folder prodi (subfolder)
        const prodiFolders = fs.readdirSync(uploadsDir).filter((file) => {
            return fs.statSync(path.join(uploadsDir, file)).isDirectory();
        });

        prodiFolders.forEach((prodi) => {
            const prodiPath = path.join(uploadsDir, prodi);
            const idCardFiles = fs.readdirSync(prodiPath).filter((file) => {
                return file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg");
            });

            idCardFiles.forEach((file) => {
                // Ambil info file time
                const filePath = path.join(prodiPath, file);
                const stats = fs.statSync(filePath);

                // Parse nama file: NIM_Nama_Prodi_Counter.png
                // Contoh: 10112_Budi_Santoso_Informatika_1.png
                const parts = file.split("_");
                let nim = "";
                let name = "";

                // Simple logic untuk parsing, bisa disesuaikan
                if (parts.length >= 2) {
                    nim = parts[0];
                    // Nama mungkin mengandung spasi yg jadi underscore, jadi kita ambil part tengah
                    // Tapi ini logic kasar, cukup tampilkan nama file dlu
                    name = parts[1];
                }

                files.push({
                    filename: file,
                    filepath: `/uploads/idcards/${prodi}/${file}`, // Path publik
                    prodi: prodi,
                    createdAt: stats.birthtime,
                    size: stats.size
                });
            });
        });

        // Sort by terbaru (descending)
        files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ success: true, files });
    } catch (error) {
        console.error("Gallery API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch gallery" },
            { status: 500 }
        );
    }
}
