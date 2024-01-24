import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextApiRequest) {
  console.log(["IN MIDDLEWARE", req.body, req.query, req.headers, req.cookies]);
  //console.log("QUERY");
  // req.nextUrl.searchParams.forEach((v, k) => {
  //   console.log([k, v]);
  // });
  // console.log("HEADERS");
  // req.headers.forEach((v, k) => {
  //   console.log([k, v]);
  // });
  NextResponse.next();

  const id_token = req.cookies.get("id_token");
  const referer = req.headers.get("referer");
  console.log(["REFERER", referer]);
  if (referer) {
    const from = new URL(referer);
    console.log(["HOSTNAME", from.hostname]);
    console.log(["PATHNAME", from.pathname]);
    console.log(["ENV.SHOPIFY_APP_URL", process.env.SHOPIFY_APP_URL]);
    if (
      process.env.SHOPIFY_APP_URL!.includes(from.hostname) &&
      from.pathname == "/api/shopify_login"
    )
      return NextResponse.next();
  }
  console.log(["ID_TOKEN", id_token]);

  if (id_token) {
    return NextResponse.next();
  }

  const client_id = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
  const redirect_uri = `${process.env.SHOPIFY_APP_URL!}/api/shopify_login`;

  const authorizationRequestUrl = new URL(
    `https://shopify.com/${process.env.SHOPIFY_STORE_ID!}/auth/oauth/authorize`
  );

  authorizationRequestUrl.searchParams.append(
    "scope",
    "openid email https://api.customers.com/auth/customer.graphql"
  );
  authorizationRequestUrl.searchParams.append("client_id", client_id);
  authorizationRequestUrl.searchParams.append("response_type", "code");
  authorizationRequestUrl.searchParams.append("redirect_uri", redirect_uri);
  authorizationRequestUrl.searchParams.append("state", generateState());
  authorizationRequestUrl.searchParams.append("nonce", generateNonce(10));

  return NextResponse.redirect(authorizationRequestUrl);
}

export const config = {
  matcher: "/((?!api|favicon.ico|login|validate).*)",
};

function generateState(): string {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2);
  return timestamp + randomString;
}
function generateNonce(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    nonce += characters.charAt(randomIndex);
  }

  return nonce;
}
//import jwt, { JwtPayload } from "jsonwebtoken";

//  const url = new URL("/login", req.url);
//  const webtoken = req.cookies.get("jwt");
//  if (!webtoken) {
//    return NextResponse.redirect(url);
//  }
//  let payload;
//  try {
//    payload = JSON.parse(
//      (jwt.verify(webtoken.value, process.env.JWT_TOKEN!) as JwtPayload)
//        .payload,
//      (key, value) => {}
//    );
//  } catch {
//    return NextResponse.redirect(url);
//  }
//  const res = NextResponse.next();
//  res.headers.set("X-data", JSON.stringify(payload));
//  return res;
