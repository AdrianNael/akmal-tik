const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const sharp = require("sharp");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/tmp" });

// path ke file counter
const counterFile = path.join(process.cwd(), "public", "uploads", "idcards", "counters.json");

// load counter dari file
function loadCounters() {
  if (!fs.existsSync(counterFile)) return {};
  return JSON.parse(fs.readFileSync(counterFile, "utf-8"));
}

// simpan counter ke file
function saveCounters(counters) {
  fs.writeFileSync(counterFile, JSON.stringify(counters, null, 2));
}

app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// --- remove background ---
app.post("/remove-background", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Rename agar sharp mengenali formatnya (tambah .png)
  const originalInput = req.file.path;
  const inputPath = req.file.path + ".png";
  fs.renameSync(originalInput, inputPath);

  const resizedPath = `${inputPath}-resized.png`;
  const bgRemovedPath = `${inputPath}-no-bg.png`;
  const finalPath = `${inputPath}-final.png`;

  try {
    const metadata = await sharp(inputPath).metadata();
    await sharp(inputPath).resize({ width: 800 }).toFile(resizedPath);

    // Debug platform
    console.log("Platform terdeteksi (Express):", process.platform);
    // Deteksi platform: Windows gunakan 'rembg', Linux gunakan path spesifik atau python3
    const rembgCmd = process.platform === "win32" ? "rembg" : "/home/sip/.local/bin/rembg";
    const cmd = `${rembgCmd} i "${resizedPath}" "${bgRemovedPath}"`;

    console.log("Running command:", cmd);  // Debugging


    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        console.error("Rembg error:", error);
        console.error("Rembg stderr:", stderr);
        return res.status(500).json({
          error: "Failed to remove background",
          details: error.message,
          stderr: stderr,
          cmd: cmd
        });
      }

      try {
        await sharp(bgRemovedPath)
          .resize({ width: metadata.width })
          .blur(0.3)
          .median(3)
          .toFile(finalPath);

        res.sendFile(path.resolve(finalPath), (err) => {
          if (err) console.error("SendFile error:", err);

          [inputPath, resizedPath, bgRemovedPath, finalPath].forEach((p) => {
            fs.unlink(p, (err) => {
              if (err) console.error("Failed to delete file:", p, err);
            });
          });
        });
      } catch (err) {
        console.error("Sharp error:", err);
        res.status(500).json({ error: "Failed to process final image" });
      }
    });
  } catch (err) {
    console.error("Resize error:", err);
    res.status(500).json({ error: "Failed to resize image" });
  }
});

// --- save idcard ---
app.post("/save-idcard", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const { prodi, nim, name } = req.body;
    console.log("📩 Request diterima:", { prodi, nim, name, file: req.file });

    // counter unik per nim+prodi
    const baseKey = `${nim}_${prodi}`;
    let counters = loadCounters();
    const safeProdi = prodi.replace(/\s+/g, "_");

    console.log("📊 Counters sebelum:", counters);

    let counter = counters[baseKey] ? counters[baseKey] + 1 : 1;
    counters[baseKey] = counter;
    saveCounters(counters);

    console.log(`🔢 Counter untuk ${baseKey}:`, counter);

    const finalNim = nim || "UNKNOWN_NIM";
    const finalName = (name || "UNKNOWN_NAME").replace(/\s+/g, "_");
    const currentSafeProdi = (prodi || "TANPA_PRODI").replace(/\s+/g, "_");

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    const targetDir = path.join(process.cwd(), "public", "uploads", "idcards", year, month, currentSafeProdi);

    console.log("📂 Target folder:", targetDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log("📁 Folder dibuat:", targetDir);
    }

    const filename = `${finalNim}_${finalName}.png`;

    const targetPath = path.join(targetDir, filename);
    console.log("🎯 Target file:", targetPath);

    fs.renameSync(req.file.path, targetPath);
    console.log(
      "✅ File berhasil dipindahkan:",
      req.file.path,
      "→",
      targetPath
    );

    return res.json({
      success: true,
      message: "File berhasil disimpan",
      filePath: `/uploads/idcards/${year}/${month}/${safeProdi}/${filename}`,
      counter: counter,
    });
  } catch (err) {
    console.error("❌ Save error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save file",
      error: err.message,
      stack: err.stack,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
