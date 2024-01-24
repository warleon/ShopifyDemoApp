import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = new URL(
    `https://shopify.com/${process.env.SHOPIFY_STORE_ID}/auth/logout`
  );
  const id_token = req.query["id_token"] as string;
  if (!id_token) return res.status(400).send("");
  url.searchParams.append("id_token", id_token);
  await fetch(url);
  return res.status(200).send("Logged out");
}
