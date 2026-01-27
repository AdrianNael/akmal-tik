import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://siup.universitaspertamina.ac.id/api/akmal", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Respon bukan JSON, datanya:", text.slice(0, 200));
      return NextResponse.json(
        { error: "Respon bukan JSON", preview: text.slice(0, 200) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error("SIUP API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
