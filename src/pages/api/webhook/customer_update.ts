import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";
import {
  WebhookFields,
  WebhookValidationErrorReason,
  WebhookValidationInvalid,
  WebhookValidationMissingHeaders,
} from "@shopify/shopify-api";
import { getShopify } from "@/global";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("incorrect method " + req.method);
    res.status(405).setHeader("Allow", "POST").send("Method Not Allowed");
  }
  const { valid, ...others } = await getShopify().webhooks.validate({
    rawBody: JSON.stringify(req.body), // is a string
    rawRequest: req,
    rawResponse: res,
  });

  if (!valid) {
    console.log({ valid, ...others });
    const reason = others as WebhookValidationInvalid;
    res.status(400);
    if (reason.reason === WebhookValidationErrorReason.MissingHeaders) {
      res.send(
        `${reason.reason} : ${JSON.stringify(
          (reason as WebhookValidationMissingHeaders).missingHeaders
        )}`
      );
    } else {
      res.send(reason.reason);
    }
    return;
  }

  const fields = others as WebhookFields;
  //TODO register client id and email in a database to send email when needed
  console.log(fields);

  res.status(200).send("");
  console.log(
    "-------------------------- BEGIN REQUEST HANDLE --------------------------"
  );

  console.log(
    "-------------------------- END REQUEST HANDLE --------------------------"
  );
}
