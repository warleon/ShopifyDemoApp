import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const macEngine = createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!);
  macEngine.update(JSON.stringify(req.body));
  const hash = macEngine.digest("base64");
  res.status(200).send("");
  console.log(
    "-------------------------- BEGIN REQUEST HANDLE --------------------------"
  );

  console.log("--------- req.hmac-hash ---------");
  console.log(hash);
  console.log(req.headers["x-shopify-hmac-sha256"]);
  console.log("--------- req.headers ---------");
  console.log(req.headers);
  console.log("--------- req.body ---------");
  console.log(req.body);
  console.log(
    "-------------------------- END REQUEST HANDLE --------------------------"
  );
}
