import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest){
    const token = req.cookies.get('token')?.value

    const protectedroutes= ["/"]

    if (protectedroutes.some((route)=>req.nextUrl.pathname.startsWith(route))){
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url)) 
        }
    }
    return NextResponse.next()
}

export const config = {
  matcher: ["/"],
};
