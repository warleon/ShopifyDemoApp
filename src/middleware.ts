import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";

export async function middleware(req: NextRequest) {
  const url = new URL("/login", req.url);
  const webtoken = req.cookies.get("jwt");
  if (!webtoken) {
    return NextResponse.redirect(url);
  }
  let payload;
  try {
    payload = JSON.parse(
      (jwt.verify(webtoken.value, process.env.JWT_TOKEN!) as JwtPayload).payload
    );
  } catch {
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-data", JSON.stringify(payload));
  return res;
}

export const config = {
  matcher: "/((?!api|favicon.ico|login|validate).*)",
};

//  const code = req.nextUrl.searchParams.get("code");
//  const state = req.nextUrl.searchParams.get("state");
//  const client_id = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
//  const redirect_uri = `${process.env.SHOPIFY_APP_URL!}/`;
//
//  if (!(code && state)) {
//    const authorizationRequestUrl = new URL(
//      `https://shopify.com/${process.env
//        .SHOPIFY_STORE_ID!}/auth/oauth/authorize`
//    );
//
//    authorizationRequestUrl.searchParams.append(
//      "scope",
//      "openid email https://api.customers.com/auth/customer.graphql"
//    );
//    authorizationRequestUrl.searchParams.append("client_id", client_id);
//    authorizationRequestUrl.searchParams.append("response_type", "code");
//    authorizationRequestUrl.searchParams.append("redirect_uri", redirect_uri);
//    authorizationRequestUrl.searchParams.append("state", generateState());
//    authorizationRequestUrl.searchParams.append("nonce", generateNonce(10));
//
//    return NextResponse.redirect(authorizationRequestUrl);
//  } else {
//    const authenticationRequestUrl = new URL(
//      `https://shopify.com/${process.env.SHOPIFY_STORE_ID!}/auth/oauth/token`
//    );
//    const sanitizedCode = code.replaceAll("+", "-").replaceAll("/", "_");
//
//    const body = new URLSearchParams();
//    body.append("grant_type", "authorization_code");
//    body.append("client_id", client_id);
//    body.append("client_secret", process.env.SHOPIFY_HEADLESS_CLIENT_SECRET!);
//    body.append("redirect_uri", redirect_uri);
//    body.append("code", code);
//    const headers = {
//      "content-type": "application/x-www-form-urlencoded",
//      // Confidential Client
//      Authorization: `Basic ${code}`,
//    };
//
//    const token = await fetch(authenticationRequestUrl, {
//      method: "POST",
//      headers: headers,
//      body,
//    }).then((r: Response) => {
//      console.log(r.status);
//      return r.json();
//    });
//    console.log(token);
//  }
//
//function generateState(): string {
//  const timestamp = Date.now().toString();
//  const randomString = Math.random().toString(36).substring(2);
//  return timestamp + randomString;
//}
//function generateNonce(length: number) {
//  const characters =
//    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//  let nonce = "";
//
//  for (let i = 0; i < length; i++) {
//    const randomIndex = Math.floor(Math.random() * characters.length);
//    nonce += characters.charAt(randomIndex);
//  }
//
//  return nonce;
//}
