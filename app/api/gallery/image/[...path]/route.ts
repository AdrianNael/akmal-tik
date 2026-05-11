
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const pathParts = (await params).path;
        // Gabungkan path untuk mendapatkan lokasi file fisik
        // public/uploads/idcards/ + path dari URL
        const filePath = path.join(process.cwd(), "public", "uploads", "idcards", ...pathParts);

        if (!fs.existsSync(filePath)) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // Baca file sebagai buffer
        const fileBuffer = fs.readFileSync(filePath);
        
        // Tentukan content type berdasarkan ekstensi
        const ext = path.extname(filePath).toLowerCase();
        const contentType = ext === ".png" ? "image/png" : "image/jpeg";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Image Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
