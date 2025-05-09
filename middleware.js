import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

let defaultLocale = "en";
let locales = ["bn", "en", "ar"];

// Get the preferred locale, similar to above or using a library
function getLocale(request) {
  const acceptedLanguage = request.headers.get("accept-language") ?? undefined;
  let headers = { "accept-language": acceptedLanguage };
  let languages = new Negotiator({ headers }).languages();

  return match(languages, locales, defaultLocale);
}

export function middleware(request) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  const session = request.cookies.get("session");

  //rutas protegidas
  const protectedRoutes = {
    "en/dashboard": [1],
    "en/crear-ticket": [3],
    "en/gestionar-usuarios": [1],
    "en/agregar-usuario": [1],
    "en/gestionar-departamentos": [1],
    "en/task": [2]
  };

  if (session) {
    try {
      const user = JSON.parse(session);
      const userRoutes = protectedRoutes[pathname];
      if (userRoutes && !userRoutes.includes(user.role)) {
        return NextResponse.redirect("en/redirecting");
      }
    } catch (e) {
      return NextResponse.redirect("en/");
    }
  } else {
    if (Object.keys(protectedRoutes).includes(pathname)) {
      return NextResponse.redirect("en/redirecting");
    }
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    //"/((?!api|assets|.*\\..*|_next).*)",
    "/((?!api|assets|docs|.*\\..*|_next).*)"
    // Optional: only run on root (/) URL
  ]
};
//
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// const protectedRoutes = {
//   "/en/dashboard": [1], // Admin, Técnico, Usuario
//   "/en/crear-ticket": [3], // Solo Usuario
//   "/en/gestionar-usuarios": [1], // Solo Admin
//   "/en/agregar-usuario": [1], // Solo Admin
//   "/en/gestionar-departamentos": [1], // Solo Admin
//   "/en/task": [2] // Solo Técnico
// };

// const roleLandingPages = {
//   1: "/en/dashboard", // Admin
//   2: "/en/task", // Técnico
//   3: "/en/crear-ticket" // Usuario
// };

// export async function middleware(request) {
//   const { pathname } = request.nextUrl;
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//     secureCookie: false
//   });

//   // Debug
//   console.log("\n--- Middleware Execution ---");
//   console.log("Path:", pathname);
//   console.log("Token completo:", token);

//   // Redirección desde raíz
//   if (pathname === "/") {
//     if (token) {
//       const landingPage = roleLandingPages[token.user?.role] || "/en/dashboard";
//       return NextResponse.redirect(new URL(landingPage, request.url));
//     }
//     return NextResponse.redirect(new URL("/en", request.url));
//   }

//   // Redirección post-login
//   if (pathname === "/en") {
//     if (token) {
//       const landingPage = roleLandingPages[token.user?.role] || "/en/dashboard";
//       return NextResponse.redirect(new URL(landingPage, request.url));
//     }
//     return NextResponse.next();
//   }

//   // Protección de rutas
//   const routeRoles = protectedRoutes[pathname];
//   if (routeRoles) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/en", request.url));
//     }

//     if (!routeRoles.includes(token.user?.role)) {
//       const landingPage = roleLandingPages[token.user?.role] || "/en/dashboard";
//       return NextResponse.redirect(new URL(landingPage, request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/en/:path*"]
// };

// import { NextResponse } from "next/server";
// import { match } from "@formatjs/intl-localematcher";
// import Negotiator from "negotiator";

// let defaultLocale = "en";
// let locales = ["bn", "en", "ar"];

// // Get the preferred locale, similar to above or using a library
// function getLocale(request) {
//   const acceptedLanguage = request.headers.get("accept-language") ?? undefined;
//   let headers = { "accept-language": acceptedLanguage };
//   let languages = new Negotiator({ headers }).languages();

//   return match(languages, locales, defaultLocale);
// }

// export function middleware(request) {
//   // Check if there is any supported locale in the pathname
//   const pathname = request.nextUrl.pathname;

//   const session = request.cookies.get("session");

//   //rutas protegidas
//   const protectedRoutes = {
//     "en/dashboard": [1],
//     "en/crear-ticket": [3],
//     "en/gestionar-usuarios": [1],
//     "en/agregar-usuario": [1],
//     "en/gestionar-departamentos": [1],
//     "en/task": [2]
//   };

//   if (session) {
//     try {
//       const user = JSON.parse(session);
//       const userRoutes = protectedRoutes[pathname];
//       if (userRoutes && !userRoutes.includes(user.role)) {
//         return NextResponse.redirect("en/dashboard");
//       }
//     } catch (e) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   } else {
//     if (Object.keys(protectedRoutes).includes(pathname)) {
//       NextResponse.redirect(new URL("/en/dashboard", request.url));
//     }
//   }

//   const pathnameIsMissingLocale = locales.every(
//     (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
//   );

//   // Redirect if there is no locale
//   if (pathnameIsMissingLocale) {
//     const locale = getLocale(request);

//     // e.g. incoming request is /products
//     // The new URL is now /en-US/products
//     return NextResponse.redirect(
//       new URL(`/${locale}/${pathname}`, request.url)
//     );
//   }
// }

// export const config = {
//   matcher: [
//     // Skip all internal paths (_next, assets, api)
//     //"/((?!api|assets|.*\\..*|_next).*)",
//     "/((?!api|assets|docs|.*\\..*|_next).*)"
//     // Optional: only run on root (/) URL
//   ]
// };
