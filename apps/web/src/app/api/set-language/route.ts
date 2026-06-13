import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { locale } = await request.json();
    
    if (locale !== "en" && locale !== "hi") {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to set language" }, { status: 500 });
  }
}
