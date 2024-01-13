import type { NextApiRequest, NextApiResponse } from "next";
import stringify from "json-stable-stringify";
import { Hmac, createHmac } from "crypto";
import { Url } from "url";

type ShopifyInstall = {
  hmac: string;
  code: string;
  shop: Url;
  state: number;
  timestamp: Date;
  embedded?: boolean;
};

function validateInput(data: any): ShopifyInstall | null {
  if (
    data.hmac === undefined ||
    data.code === undefined ||
    data.shop === undefined ||
    data.state === undefined ||
    data.timestamp === undefined
  )
    return null;

  return data as ShopifyInstall;
}
function validateHmac(data: ShopifyInstall): boolean {
  console.log(data);
  const { hmac, ...withoutHmac } = data;
  console.log(withoutHmac);
  const macEngine = createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!);
  macEngine.update(stringify(withoutHmac));
  const computeHmac = macEngine.digest("base64");
  console.log([hmac, computeHmac]);
  return computeHmac === hmac;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }
  console.log(
    "----------------------------- ENTER INSTALL HANDLER -----------------------------"
  );
  const data = validateInput(req.query);
  if (data === null) {
    res.status(422).send("Unprocessable Entity");
    return;
  }

  if (!validateHmac(data)) {
    res.status(403).send("Forbidden");
    return;
  }
  console.log(
    "----------------------------- START OAUTH PROCCESS -----------------------------"
  );

  res.status(200).send("Ok");
}
