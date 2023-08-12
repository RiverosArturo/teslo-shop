import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware( req: NextRequest ){
    // const token = String(req.cookies.get( 'token' )?.value);
    // if( token.length <= 10 ){
    //     const requestedPage = req.nextUrl.pathname;
    //     const url = req.nextUrl.clone();
    //     url.pathname = `/auth/login`;
    //     url.search = `p=${ requestedPage }`;

    //     return NextResponse.redirect( url );
    // }
    // await jwt.isValidToken(token);
    // return NextResponse.next();

    // try {
    //     await jwt.isValidToken(token);
    //     return NextResponse.next();
    // } catch (error) {
    //     console.log("Token no valido");
    //     const requestedPage = req.nextUrl.pathname;
    //     const url = req.nextUrl.clone();
    //     url.pathname = `/auth/login`;
    //     url.search = `p=${ requestedPage }`;

    //     return NextResponse.redirect( url );
    // }

    //Esta opcion solo funciona si iniciamos sesion con NextAuth (http://localhost:3000/api/auth/signin)
    const session: any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET});
    // informacion sobre el usuario
    // console.log(session);
    console.log( req.nextUrl.pathname);
    if(!session){
        const requestedPage = req.nextUrl.pathname;
        const url = req.nextUrl.clone();
        url.pathname = `/auth/login`;
        url.search = `p=${ requestedPage }`;

        return NextResponse.redirect( url );
    }

    if( req.nextUrl.pathname === '/checkout/address' || req.nextUrl.pathname === '/checkout/summary') return NextResponse.next();

    if( req.nextUrl.pathname.startsWith('/admin') && session.user.role === 'admin' ){
        return NextResponse.next();
    }else{
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }
}

export const config = {
    matcher: ['/checkout/address','/checkout/summary','/admin/:path*','/((?!api\/)/admin/:path.*)'],
}