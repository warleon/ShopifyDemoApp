import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, res: NextResponse) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const client_id = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
  const redirect_uri = `${process.env.SHOPIFY_APP_URL!}/`;

  if (!(code && state)) {
    const authorizationRequestUrl = new URL(
      `https://shopify.com/${process.env
        .SHOPIFY_STORE_ID!}/auth/oauth/authorize`
    );

    authorizationRequestUrl.searchParams.append("scope", "openid email");
    authorizationRequestUrl.searchParams.append("client_id", client_id);
    authorizationRequestUrl.searchParams.append("response_type", "code");
    authorizationRequestUrl.searchParams.append("redirect_uri", redirect_uri);
    authorizationRequestUrl.searchParams.append("state", generateState());
    authorizationRequestUrl.searchParams.append("nonce", generateNonce(10));

    return NextResponse.redirect(authorizationRequestUrl);
  } else {
    const authenticationRequestUrl = new URL(
      `https://shopify.com/${process.env.SHOPIFY_STORE_ID!}/auth/oauth/token`
    );

    const postBody = JSON.stringify({
      grant_type: "authorization_code",
      client_id: client_id,
      redirect_uri: redirect_uri,
      code: code.replaceAll("+", "-").replaceAll("/", "_"),
    });
    console.log(postBody);
    const token = await fetch(authenticationRequestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: postBody,
    }).then((r: Response) => r.json());
    console.log(token);
  }
}

export const config = {
  matcher: "/((?!api|favicon.ico).*)",
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
