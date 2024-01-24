import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/global";
import { ShopifyAccessCode } from "@prisma/client";

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
  //const sanitizedCode = code.replaceAll("+", "-").replaceAll("/", "_");

  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("client_id", client_id);
  body.append("client_secret", process.env.SHOPIFY_HEADLESS_CLIENT_SECRET!);
  body.append("redirect_uri", redirect_uri);
  body.append("code", code);

  const credentials = await crypto.subtle.digest(
    { name: "SHA-256" },
    new TextEncoder().encode(
      `${process.env.SHOPIFY_CLIENT_ID}:${process.env.SHOPIFY_CLIENT_SECRET}`
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

  const accessCode = (await response.json()) as ShopifyAccessCode;

  console.log(accessCode);

  const { id_token } = await prisma.shopifyAccessCode.create({
    data: {
      access_token: accessCode.access_token,
      expires_in: accessCode.expires_in,
      id_token: accessCode.id_token,
      refresh_token: accessCode.refresh_token,
    },
    select: {
      id_token: true,
    },
  });
  res
    .appendHeader("Set-Cookie", `id_token=${id_token};Path=/;HttpOnly`)
    .status(200)
    .redirect("/");
  //.redirect(process.env.SHOPIFY_APP_URL!);
}

//async function useToken(req:NextApiRequest) {
//  const clientId = process.env.CLIENT_ID!;
//  const customerApiClientId = "30243aa5-17c1-465a-8493-944bcc4e88aa";
//  const accessToken = req.cookies["accessToken"]
//  if(!accessToken)return
//  const body = new URLSearchParams();
//
//  body.append("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
//  body.append("client_id", clientId);
//  body.append("audience", customerApiClientId);
//  body.append("subject_token", accessToken);
//  body.append(
//    "subject_token_type",
//    "urn:ietf:params:oauth:token-type:access_token"
//  );
//  body.append("scopes", "https://api.customers.com/auth/customer.graphql");
//
//  const headers = {
//    "content-type": "application/x-www-form-urlencoded",
//    // Confidential Client
//    Authorization: "Basic `<credentials>`",
//  };
//
//  const response = await fetch(
//    `https://shopify.com/${}/auth/oauth/token`,
//    {
//      method: "POST",
//      headers: headers,
//      body,
//    }
//  );
//
//  interface AccessTokenResponse {
//    access_token: string;
//    expires_in: number;
//  }
//
//  const { access_token } = (await response.json()) as AccessTokenResponse;
//}
//

//async function getUserData(access_token:string) {
//  const url = new URL(
//    `https://shopify.com/${process.env.SHOPIFY_STORE_ID}/account/customer/api/unstable/graphql`
//  );
//  const response = await fetch(
//url,  {
//    method: 'POST',
//    headers: {
//      'Content-Type': 'application/json',
//      Authorization: access_token,
//    },
//    body: JSON.stringify({
//      operationName: 'SomeQuery',
//      'query { personalAccount { email }}',
//      variables: {},
//    })
//  }
//  )
//
//}
