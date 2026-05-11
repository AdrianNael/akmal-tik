import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const prodi = formData.get("prodi");
    const nim = formData.get("nim");
    const name = formData.get("name");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Jika data kosong, berikan fallback agar tidak error atau menghasilkan ___
    const finalNim = nim || "UNKNOWN_NIM";
    const finalName = (name || "UNKNOWN_NAME").replace(/\s+/g, "_");
    const safeProdi = (prodi || "TANPA_PRODI").replace(/\s+/g, "_");

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Simpan di public/uploads agar bisa diakses oleh Next.js
    const targetDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "idcards",
      year,
      month,
      safeProdi
    );
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = `${finalNim}_${finalName}.png`;
    const targetPath = path.join(targetDir, filename);

    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json({
      success: true,
      message: "File berhasil disimpan",
      filePath: `/uploads/idcards/${year}/${month}/${safeProdi}/${filename}`,
    });
  } catch (err) {
    console.error("❌ save-idcard error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
