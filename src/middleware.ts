import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const id_token = req.cookies.get("id_token");
  const access_token = req.cookies.get("access_token");
  console.log(["ID_TOKEN", id_token]);
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

  if (id_token && access_token) {
    //    //TODO query shopify to get customer data
    return NextResponse.next();
  }
  return NextResponse.redirect(authorizationRequestUrl);
}

export const config = {
  matcher: "/",
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
