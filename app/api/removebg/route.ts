import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.REMOVAL_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("image_file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: "No valid image uploaded" },
      { status: 400 }
    );
  }

  const proxyForm = new FormData();
  proxyForm.append("image_file", file, (file as any).name || "upload.png");

  // Validasi jenis file
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 }
    );
  }

  // Konversi File ke Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const form = new FormData();
  form.append("image_file", new Blob([buffer], { type: file.type }), file.name);

  try {
    const res = await fetch("https://sdk.photoroom.com/v1/segment", {
      method: "POST",
      headers: {
        "X-API-KEy": apiKey,
      },
      body: proxyForm,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const imageBuffer = await res.arrayBuffer();

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=output.png",
      },
    });
  } catch (error) {
    console.error("removal.ai failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
