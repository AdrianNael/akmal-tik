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
const counterFile = path.join(__dirname, "uploads", "idcards", "counters.json");

// load counter dari file
function loadCounters() {
  if (!fs.existsSync(counterFile)) return {};
  return JSON.parse(fs.readFileSync(counterFile, "utf-8"));
}

// simpan counter ke file
function saveCounters(counters) {
  fs.writeFileSync(counterFile, JSON.stringify(counters, null, 2));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- remove background ---
app.post("/remove-background", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const inputPath = req.file.path;
  const resizedPath = `${inputPath}-resized.png`;
  const bgRemovedPath = `${inputPath}-no-bg.png`;
  const finalPath = `${inputPath}-final.png`;

  try {
    const metadata = await sharp(inputPath).metadata();

    await sharp(inputPath).resize({ width: 800 }).toFile(resizedPath);

    // Gunakan 'rembg' command standard (lebih cepat tanpa alpha matting)
    const cmd = `rembg i "${resizedPath}" "${bgRemovedPath}"`;

    console.log("Running command:", cmd); // Debugging


    exec(cmd, async (error) => {
      if (error) {
        console.error("Rembg error:", error);
        return res.status(500).json({ error: "Failed to remove background" });
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

    // bikin folder per prodi
    const prodiDir = path.join(__dirname, "uploads", "idcards", safeProdi);
    console.log("📂 Target folder:", prodiDir);

    if (!fs.existsSync(prodiDir)) {
      fs.mkdirSync(prodiDir, { recursive: true });
      console.log("📁 Folder dibuat:", prodiDir);
    } else {
      console.log("✅ Folder sudah ada:", prodiDir);
    }

    // nama file akhir
    const safeName = name.replace(/\s+/g, "_");
    const filename = `${nim}_${safeName}_${safeProdi}_${counter}.png`;

    const targetPath = path.join(prodiDir, filename);
    console.log("🎯 Target file:", targetPath);

    // pindahkan file dari tmp → folder tujuan
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
      filePath: `/uploads/idcards/${safeProdi}/${filename}`,
      counter: counter,
    });
  } catch (err) {
    console.error("❌ Save error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save file",
      error: err.message, // biar tau pesan error aslinya
      stack: err.stack, // biar keliatan trace errornya
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
