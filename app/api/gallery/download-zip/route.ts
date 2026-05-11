
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
    try {
        const { files } = await req.json();

        if (!files || !Array.isArray(files) || files.length === 0) {
            return NextResponse.json({ error: "Tidak ada file untuk diunduh" }, { status: 400 });
        }

        const zip = new JSZip();

        for (const file of files) {
            // file.filepath biasanya: /api/gallery/image/2026/05/Prodi/filename.png
            // Kita butuh path fisik: public/uploads/idcards/2026/05/Prodi/filename.png
            let internalPath = file.filepath;
            if (internalPath.includes("/api/gallery/image/")) {
                internalPath = internalPath.replace("/api/gallery/image/", "/uploads/idcards/");
            }

            const absolutePath = path.join(process.cwd(), "public", internalPath);

            if (fs.existsSync(absolutePath)) {
                const fileData = fs.readFileSync(absolutePath);
                // Tambahkan ke ZIP dengan nama file aslinya
                zip.file(file.filename, fileData);
            }
        }

        // Generate ZIP sebagai buffer
        const zipContent = await zip.generateAsync({ type: "nodebuffer" });

        // Tentukan nama file ZIP
        const timestamp = new Date().getTime();
        const zipFilename = `IDCards_Archive_${timestamp}.zip`;

        return new NextResponse(zipContent, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${zipFilename}"`,
            },
        });

    } catch (error) {
        console.error("ZIP Generation Error:", error);
        return NextResponse.json({ error: "Gagal membuat file ZIP" }, { status: 500 });
    }
}
