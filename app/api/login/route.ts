// app/api/login/route.ts
import { NextResponse } from "next/server";

const USER = { username: "admin", password: "12345" };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (username === USER.username && password === USER.password) {
      const res = NextResponse.json(
        { success: true, message: "Login success" },
        { status: 200 }
      );

      res.cookies.set("token", "dummy-token", {
        httpOnly: true,
        path: "/",
      });

      return res; // ✅ harus return Response
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
