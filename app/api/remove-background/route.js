import { NextResponse } from "next/server";
import { exec } from "child_process";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req) {
  let inputPath, resizedPath, bgRemovedPath, finalPath;

  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpDir = path.join(process.cwd(), "uploads/tmp");
    await fs.mkdir(tmpDir, { recursive: true });

    inputPath = path.join(tmpDir, `${Date.now()}-${file.name}`);
    await fs.writeFile(inputPath, buffer);

    resizedPath = `${inputPath}-resized.png`;
    bgRemovedPath = `${inputPath}-no-bg.png`;
    finalPath = `${inputPath}-final.png`;

    const metadata = await sharp(inputPath).metadata();
    await sharp(inputPath).resize({ width: 800 }).toFile(resizedPath);

    await new Promise((resolve, reject) => {
      // Deteksi berdasarkan path: jika mengandung C:\ maka gunakan 'rembg' (Windows)
      const isWindows = resizedPath.includes(":\\") || process.platform === "win32";
      const rembgCmd = isWindows ? "rembg" : "/home/sip/.local/bin/rembg";
      const cmd = `${rembgCmd} i "${resizedPath}" "${bgRemovedPath}"`;
      
      console.log("DEBUG - isWindows:", isWindows);
      console.log("DEBUG - Command yang digunakan:", cmd);

      exec(cmd, (err, stdout, stderr) => {
        if (stdout) console.log("Rembg stdout:", stdout);
        if (stderr) console.error("Rembg stderr:", stderr);

        if (err) return reject(err);
        resolve();
      });
    });

    await sharp(bgRemovedPath)
      .resize({ width: metadata.width })
      .toFile(finalPath);

    const fileBuffer = await fs.readFile(finalPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    console.error("❌ DEBUG ERROR WINDOWS:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    // Cleanup
    for (const p of [inputPath, resizedPath, bgRemovedPath, finalPath]) {
      if (p) fs.unlink(p).catch(() => { });
    }
  }
}
