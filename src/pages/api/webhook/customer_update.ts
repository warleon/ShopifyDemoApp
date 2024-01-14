import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";
import {
  WebhookFields,
  WebhookValidationErrorReason,
  WebhookValidationInvalid,
  WebhookValidationMissingHeaders,
} from "@shopify/shopify-api";
import { getShopify } from "@/global";
import stringify from "json-stable-stringify";
import { PrismaClient } from "@prisma/client";

function validateHmac(data: any, hmac: string): boolean {
  const macEngine = createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!);
  macEngine.update(JSON.stringify(data));
  const computeHmac = macEngine.digest("base64");
  return computeHmac === hmac;
}

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("incorrect method " + req.method);
    res.status(405).setHeader("Allow", "POST").send("Method Not Allowed");
  }
  const { valid, ...others } = await getShopify().webhooks.validate({
    rawBody: stringify(req.body), // is a string
    rawRequest: req,
    rawResponse: res,
  });

  if (!valid) {
    console.log({ valid, ...others });
    const reason = others as WebhookValidationInvalid;
    if (
      reason.reason === WebhookValidationErrorReason.InvalidHmac &&
      getShopify().config.isCustomStoreApp
    ) {
      //continue flow since api Hmac validation is bugged for CustomApps
      console.log([
        "custom validation: ",
        validateHmac(req.body, req.headers["x-shopify-hmac-sha256"] as string),
      ]);
    } else {
      res.status(400).send({ valid, ...others });
      return;
    }
    //    } else if (reason.reason === WebhookValidationErrorReason.MissingHeaders) {
    //      res
    //        .status(400)
    //        .send(
    //          `${reason.reason} : ${JSON.stringify(
    //            (reason as WebhookValidationMissingHeaders).missingHeaders
    //          )}`
    //        );
    //      return;
    //    } else {
    //      res.status(400).send(reason.reason);
    //      return;
    //    }
  }
  let fields: WebhookFields = {
    webhookId: "",
    apiVersion: "",
    domain: "",
    hmac: "",
    topic: "",
  };
  if (valid) fields = others as WebhookFields;
  else {
    // handled diferent because of ignored Hmac validation
    fields.webhookId = req.headers["x-shopify-webhook-id"] as string;
    fields.apiVersion = req.headers["x-shopify-api-version"] as string;
    fields.domain = req.headers["x-shopify-shop-domain"] as string;
    fields.hmac = req.headers["x-shopify-hmac-sha256"] as string;
    fields.topic = req.headers["x-shopify-topic"] as string;
  }
  res.status(200).send("");
  //TODO register client id and email in a database to send email when needed
  console.log(
    "-------------------------- BEGIN REQUEST HANDLE --------------------------"
  );
  const Customer = req.body as { id: bigint; email: string };
  const alreadyAdded = await prisma.customer.findUnique({
    where: { id: Customer.id },
  });
  if (alreadyAdded === null) {
    await prisma.customer.create({ data: Customer });
  }
  console.log(
    "-------------------------- END REQUEST HANDLE --------------------------"
  );
}
