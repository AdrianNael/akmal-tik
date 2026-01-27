"use client";
import { use, useEffect, useRef, useState, useId } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import IDCardCanvas, { IDCardCanvasHandle } from "./idCardCanvas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Pastikan import ini ada
import Select from "react-select";
import { toast } from "sonner";
export default function RemoveBgTool() {
  const selectId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<IDCardCanvasHandle>(null);

  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [idFoto, setIdFoto] = useState("");

  const [students, setStudents] = useState<any[]>([]);
  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [prodi, setProdi] = useState("");
  const [templateType, setTemplateType] = useState<"sarjana" | "magister">("sarjana"); // State template




  // Start camera & Fetch students
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { aspectRatio: 3 / 4 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => {
            // Ignore 'interrupted' error yang harmless
            console.log("Camera play interrupted:", e.name);
          });
          setStreaming(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        toast.error("Gagal mengakses kamera");
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/siup");
        const json = await res.json();
        if (json.success && json.data?.data?.length > 0) {
          setStudents(json.data.data);
        }
      } catch (err) {
        console.error("Fetch students error:", err);
      }
    };

    startCamera();
    fetchStudents();

    return () => {
      videoRef.current?.srcObject &&
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!nim) return;

    const selected = students.find((s) => s.nomor_induk === nim);
    if (selected) {
      setName(selected.nama);
      setProdi(selected.prodi);
    }
  }, [nim, students]);

  const handleDownloadAndSubmit = async () => {
    if (isProcessing) return;
    try {
      idCardRef.current?.download();
      toast.success("File berhasil di-download");
    } catch (err) {
      console.error("❌ Error saat download & submit:", err);
      toast.error("Gagal download hasil");
    }
  };

  const handleCountdownAndCapture = () => {
    setCountdown(2);
    setIsCountingDown(true);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          handleCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    setLoading(true);
    setResultUrl(null);

    // Faktor pembesaran sesuai device pixel ratio
    const scale = window.devicePixelRatio || 1;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    // Gambar frame video ke canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Konversi ke Blob dan kirim ke API
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("image", blob, "capture.png");

        try {
          const res = await fetch("/api/remove-background", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

          const resultBlob = await res.blob();
          const imageUrl = URL.createObjectURL(resultBlob);

          setCapturedImage(imageUrl);
          setResultUrl(imageUrl);
          toast.success("Background berhasil dihapus!");
        } catch (err) {
          console.error("Error removing background:", err);
          toast.error("Gagal memproses gambar.");
        } finally {
          setLoading(false);
        }
      },
      "image/png",
      0.9
    );
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Gambar terlalu besar (max 8 MB).");
      return;
    }

    setLoading(true);
    setResultUrl(null);

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Gagal remove background");
      }

      // Ambil hasil PNG transparan
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      toast.success("Background berhasil dihapus!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memproses gambar.");
    } finally {
      setLoading(false);
    }
  };

  // React Select Styles
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "white",
      borderColor: state.isFocused ? "hsl(var(--ring))" : "#d1d5db",
      boxShadow: "none",
      "&:hover": {
        borderColor: "hsl(var(--ring))"
      },
      color: "black",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "black",
    }),
    input: (base: any) => ({
      ...base,
      color: "black",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "white",
      border: "none",
      color: "black",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#e5e7eb"
        : "white",
      color: "black",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#e5e7eb",
      }
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#6b7280",
    }),
  };

  return (
    <div className="relative flex flex-col w-full max-w-7xl mx-auto">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-black/5 rounded-full animate-ping duration-[3s]" />
              <div className="relative bg-white p-6 rounded-2xl shadow-2xl border border-zinc-100">
                <img src="/logo.png" alt="Logo" className="h-16 w-auto animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-xl tracking-widest uppercase text-black">Universitas Pertamina</h3>
              <p className="text-sm font-medium text-zinc-400">Sedang Memproses...</p>
            </div>

            <div className="w-48 bg-zinc-100 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-black animate-[loading_1.5s_ease-in-out_infinite] w-1/3 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Left Panel - Camera & Upload */}
        <Card className="w-full h-fit border-0 shadow-2xl bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          <CardContent className="space-y-4 p-4">
            <Label className="flex justify-center font-bold text-lg mb-2">
              Ambil Foto / Upload
            </Label>

            <div className="relative w-full aspect-[3/4] bg-muted rounded-md overflow-hidden border">
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                playsInline
                muted
              />
              <Button
                onClick={handleCountdownAndCapture}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-lg"
                variant="default"
              >
                Capture Photo
              </Button>
              {isCountingDown && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-8xl font-bold bg-black/40 z-50 backdrop-blur-sm">
                  {countdown}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="upload">Atau Upload File Gambar</Label>
              <Input
                id="upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpload}
                className="cursor-pointer"
              />
            </div>

            {/* Hidden elements */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Right Panel - Result & Form */}
        <Card className="w-full h-fit border-0 shadow-2xl bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          <CardContent className="p-4 space-y-6">
            <Label className="flex justify-center font-bold text-lg">
              Preview & Data
            </Label>

            <div className="min-h-[300px] flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
              {resultUrl ? (
                <div className="w-full flex justify-center p-4">
                  <IDCardCanvas
                    ref={idCardRef}
                    photoUrl={resultUrl}
                    name={name}
                    prodi={prodi}
                    nim={nim}
                    idFoto={idFoto}
                    templateType={templateType} // Pass prop
                  />
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Preview ID Card akan muncul di sini</p>
                  <p className="text-sm opacity-60">Silakan ambil foto atau upload gambar terlebih dahulu</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Form Input */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Cari NIM / Nama</Label>
                <Select
                  instanceId={selectId}
                  options={students.map((s) => ({
                    value: s.nomor_induk,
                    label: `${s.nomor_induk} - ${s.nama}`,
                  }))}
                  value={
                    nim
                      ? { value: nim, label: `${nim} - ${name}` }
                      : null
                  }
                  onChange={(option) => setNim(option?.value || "")}
                  placeholder="Ketik untuk mencari..."
                  isClearable
                  styles={customStyles}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Nama Mahasiswa</Label>
                  <Input
                    value={name}
                    readOnly
                    className="bg-muted"
                    placeholder="Otomatis terisi"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Program Studi</Label>
                  <Input
                    value={prodi}
                    readOnly
                    className="bg-muted"
                    placeholder="Otomatis terisi"
                  />
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <Label className="mb-3 block">Pilih Template ID Card</Label>
              <RadioGroup
                defaultValue="sarjana"
                value={templateType}
                onValueChange={(v) => setTemplateType(v as "sarjana" | "magister")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sarjana" id="sarjana" />
                  <Label htmlFor="sarjana" className="cursor-pointer">Sarjana (S1)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="magister" id="magister" />
                  <Label htmlFor="magister" className="cursor-pointer">Magister (S2)</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handleDownloadAndSubmit}
              disabled={isProcessing || !resultUrl}
            >
              Download ID Card
            </Button>

          </CardContent>
        </Card>
      </div>
    </div >
  );
}
