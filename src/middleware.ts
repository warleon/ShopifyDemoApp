import { NextRequest, NextResponse } from "next/server";

const getCredentials = () =>
  crypto.subtle.digest(
    { name: "SHA-256" },
    new TextEncoder().encode(
      `${process.env.SHOPIFY_HEADLESS_CLIENT_ID!}:${process.env
        .SHOPIFY_HEADLESS_CLIENT_SECRET!}`
    )
  );

export async function middleware(req: NextRequest) {
  const id_token = req.cookies.get("id_token")?.value;
  let access_token = req.cookies.get("access_token")?.value;
  const refresh_token = req.cookies.get("refresh_token")?.value;

  if (id_token && access_token && refresh_token) {
    console.log(id_token);
    console.log(access_token);
    const response = NextResponse.next();
    access_token = await rotateToken(access_token);
    access_token = (await refreshToken(refresh_token))?.access_token;
    const data = await getUserData(access_token!);
    response.headers.set("x-data", data ?? "not found");
    return response;
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

async function getUserData(access_token: string) {
  const url = new URL(
    `https://shopify.com/${process.env
      .SHOPIFY_STORE_ID!}/account/customer/api/unstable/graphql`
  );
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: access_token,
    },
    body: JSON.stringify({
      operationName: "get",
      query: "query { customer { emailAddress }}",
      variables: {},
    }),
  });
  const result = await response.json();
  if (result.errors.length) {
    result.errors.forEach((msg: string) => {
      console.log(msg);
    });
    return null;
  }
  return result;
}

async function rotateToken(accessToken: string) {
  const clientId = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
  const customerApiClientId = "30243aa5-17c1-465a-8493-944bcc4e88aa";
  const body = new URLSearchParams();
  const credentials = await getCredentials();
  body.append("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
  body.append("client_id", clientId);
  body.append("audience", customerApiClientId);
  body.append("subject_token", accessToken);
  body.append(
    "subject_token_type",
    "urn:ietf:params:oauth:token-type:access_token"
  );
  body.append(
    "scopes",
    "openid email https://api.customers.com/auth/customer.graphql"
  );

  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    // Confidential Client
    Authorization: `Basic ${credentials}`,
  };

  const response = await fetch(
    `https://shopify.com/${process.env.SHOPIFY_STORE_ID!}/auth/oauth/token`,
    {
      method: "POST",
      headers: headers,
      body,
    }
  );
  if (response.status !== 200) return null;

  const { access_token } = await response.json();
  return access_token;
}

async function refreshToken(token: string) {
  const clientId = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
  const body = new URLSearchParams();
  const credentials = await getCredentials();

  body.append("grant_type", "refresh_token");
  body.append("client_id", clientId);
  body.append("refresh_token", token);

  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    // Confidential Client
    Authorization: `Basic ${credentials}`,
  };

  const response = await fetch(
    `https://shopify.com/${process.env.SHOPIFY_STORE_ID!}/auth/oauth/token`,
    {
      method: "POST",
      headers: headers,
      body,
    }
  );
  if (response.status !== 200) {
    console.log(response.status, await response.json());
    return null;
  }

  return await response.json();
}
