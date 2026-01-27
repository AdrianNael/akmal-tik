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

    const safeProdi = prodi.replace(/\s+/g, "_");
    const safeName = name.replace(/\s+/g, "_");

    const buffer = Buffer.from(await file.arrayBuffer());
    const targetDir = path.join(
      process.cwd(),
      "public/uploads/idcards",
      safeProdi
    );
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const filename = `${nim}_${safeName}_${safeProdi}_${Date.now()}.png`;
    const targetPath = path.join(targetDir, filename);

    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json({
      success: true,
      message: "File berhasil disimpan",
      filePath: `/uploads/idcards/${safeProdi}/${filename}`,
    });
  } catch (err) {
    console.error("❌ save-idcard error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
