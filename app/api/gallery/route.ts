
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Fungsi helper untuk membaca file secara rekursif
function getFilesRecursively(dir: string, baseDir: string): any[] {
    let results: any[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath, baseDir));
        } else {
            if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")) {
                const relativePath = path.relative(baseDir, filePath).replace(/\\/g, "/");
                // Gunakan URL absolut ke server Express port 5000 agar stabil
                const urlPath = `http://localhost:5000/uploads/idcards/${relativePath}`;
                
                // Analisa path: 2026/05/Prodi/file.png
                const pathParts = relativePath.split("/");
                
                // Ambil info dari path
                const year = pathParts.length >= 1 ? pathParts[0] : "Unknown";
                const month = pathParts.length >= 2 ? pathParts[1] : "Unknown";
                const prodi = pathParts.length >= 3 ? pathParts[pathParts.length - 2] : "Unknown";

                results.push({
                    filename: file,
                    filepath: urlPath,
                    prodi: prodi.replace(/_/g, " "),
                    year: year,
                    month: month,
                    createdAt: stat.birthtime,
                    size: stat.size
                });
            }
        }
    });
    return results;
}

export async function GET() {
    try {
        // Folder fisik tetap di public/uploads
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "idcards");

        const files = getFilesRecursively(uploadsDir, uploadsDir);

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

export async function DELETE(req: Request) {
    try {
        const { filepath } = await req.json();

        if (!filepath) {
            return NextResponse.json({ success: false, error: "Filepath is required" }, { status: 400 });
        }

        // Jika filepath adalah URL absolut, ambil path relatifnya
        let relativePath = filepath;
        if (filepath.startsWith("http")) {
            const url = new URL(filepath);
            relativePath = url.pathname; // Hasilnya: /uploads/idcards/...
        }

        // Hapus file dari folder public
        const absolutePath = path.join(process.cwd(), "public", relativePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            return NextResponse.json({ success: true, message: "File berhasil dihapus" });
        } else {
            return NextResponse.json({ success: false, error: "File tidak ditemukan di server" }, { status: 404 });
        }
    } catch (error) {
        console.error("Delete API Error:", error);
        return NextResponse.json(
            { success: false, error: "Gagal menghapus file" },
            { status: 500 }
        );
    }
}
