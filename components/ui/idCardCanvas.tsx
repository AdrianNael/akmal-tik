"use client";

import { useImperativeHandle, forwardRef, useRef } from "react";
import html2canvas from "html2canvas";

interface IDCardCanvasProps {
  photoUrl: string;
  name: string;
  prodi: string;
  nim: string;
  idFoto: string;
  templateType: "sarjana" | "magister"; // Tambahkan prop ini
}

export interface IDCardCanvasHandle {
  download: () => void;
}

const IDCardCanvas = forwardRef<IDCardCanvasHandle, IDCardCanvasProps>(
  ({ photoUrl, name, prodi, nim, idFoto, templateType }, ref) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
      try {
        // Ambil blob dari photoUrl (hasil eraser background)
        const response = await fetch(photoUrl);
        const blob = await response.blob();

        const tempFilename = `${nim}_${name}_${prodi}.png`;

        const formData = new FormData();
        formData.append("file", blob, tempFilename);
        formData.append("nim", nim);
        formData.append("name", name);
        formData.append("prodi", prodi);
        formData.append("idFoto", idFoto);

        // Simpan ke server untuk arsip galeri
        const res = await fetch("/api/save-idcard", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ Server error:", errText);
        }

        const data = await res.json();
        console.log("✅ Response server:", data);

        // Eksekusi download foto transparan ke browser
        const downloadLink = document.createElement("a");
        downloadLink.href = photoUrl;
        const displayName = (name || "ID").replace(/\s+/g, "_");
        const displayNim = nim || "Card";
        downloadLink.download = `${displayNim}_${displayName}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

      } catch (error) {
        console.error("Error downloading eraser result:", error);
      }
    };

    useImperativeHandle(ref, () => ({
      download: handleDownload,
    }), [handleDownload]);

    return (
      <div className="w-full h-auto flex flex-col items-center p-4">
        <div className="w-full max-w-[350px]">
          <div className="relative w-full aspect-[650/1024]">
            <div
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden shadow-lg"
            >
              <img
                src={templateType === "magister" ? "/template-idcard-magister.png" : "/template-idcard.png"}
                alt="ID Card Background"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <img
                src={photoUrl}
                alt="Foto Mahasiswa"
                className="absolute left-[175px] top-[245px] w-[400px] h-[620px] scale-[0.538] origin-top-left object-cover rounded-lg"
              />

              <div className="absolute text-black font-[arial] font-bold text-[32px] top-[230px] scale-[0.538] origin-top-left left-[15px] w-[300px] h-[50px] overflow-hidden">
                {name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}
              </div>

              <div className="absolute text-black font-[arial] font-medium text-[24px] scale-[0.538] origin-top-left top-[250px] left-[15px]">
                {prodi}
              </div>

              <div className="absolute text-black font-[arial] font-medium text-[24px] scale-[0.538] origin-top-left top-[265px] left-[15px]">
                {nim}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default IDCardCanvas;
