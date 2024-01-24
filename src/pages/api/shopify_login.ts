import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query["code"] as string;
  if (!code) return;
  const client_id = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
  const redirect_uri = `${process.env.SHOPIFY_APP_URL!}/api/shopify_login`;
  const authenticationRequestUrl = new URL(
    `https://shopify.com/${process.env.SHOPIFY_STORE_ID!}/auth/oauth/token`
  );

  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("client_id", client_id);
  body.append("client_secret", process.env.SHOPIFY_HEADLESS_CLIENT_SECRET!);
  body.append("redirect_uri", redirect_uri);
  body.append("code", code);

  const credentials = await crypto.subtle.digest(
    { name: "SHA-256" },
    new TextEncoder().encode(
      `${process.env.SHOPIFY_HEADLESS_CLIENT_ID!}:${process.env
        .SHOPIFY_HEADLESS_CLIENT_SECRET!}`
    )
  );

  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    // Confidential Client
    Authorization: `Basic ${credentials}`,
  };

  const response = await fetch(authenticationRequestUrl, {
    method: "POST",
    headers: headers,
    body,
  });
  console.log(response.status);
  const jsonResponse = await response.json();
  console.log(jsonResponse);

  const { id_token, access_token, refresh_token } = jsonResponse;

  res
    .appendHeader("Set-Cookie", `id_token=${id_token};Path=/`)
    .appendHeader("Set-Cookie", `access_token=${access_token};Path=/`)
    .appendHeader("Set-Cookie", `refresh_token=${refresh_token};Path=/`)
    .status(200)
    .redirect("/");
}
