import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";
import { shopify } from "@/global";
import stringify from "json-stable-stringify";
import { prisma } from "@/global";
import {
  WebhookFields,
  WebhookValidationErrorReason,
  WebhookValidationInvalid,
} from "@shopify/shopify-api";

//left unused function in code, just to show the suffer caused by shopify's buggued api
function validateHmac(data: any, hmac: string): boolean {
  const macEngine = createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!);
  macEngine.update(stringify(data));
  const computeHmac = macEngine.digest("base64");
  return computeHmac === hmac;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").send("Method Not Allowed");
    return;
  }
  // will fail for private app
  const { valid, ...others } = await shopify.webhooks.validate({
    rawBody: stringify(req.body), // also tried with JSON.stringify
    rawRequest: req,
    rawResponse: res,
  });

  if (!valid) {
    console.log(others);
    const reason = others as WebhookValidationInvalid;
    if (
      reason.reason === WebhookValidationErrorReason.InvalidHmac &&
      shopify.config.isCustomStoreApp
    ) {
      //continue flow since shopify's API Hmac validation is bugged for CustomApps
    } else {
      res.status(400).send("Bad Request");
      return;
    }
  }
  res.status(200).send("Ok"); //a legitimate shopify webhook trigger should always hit this line
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

  if (fields.topic !== "customers/update") return;
  const { id, email, created_at, first_name, last_name } = req.body;
  try {
    await prisma.customer.upsert({
      where: { id: id },
      update: {
        email: email,
        name: `${first_name} ${last_name}`,
      },
      create: {
        id: id,
        email: email,
        signedUp: created_at,
        name: `${first_name} ${last_name}`,
      },
    });
  } catch {
    // nothing to do, failure occurs when:
    // race conditions occurs on the creation part of the upsert call, wich should be rare if not unexistant
    // data in the body is missign or is of different type, this can happend only when Shopify was not the one sending the request
    // either way we already notified Shopify that the webhook has been received succesfully
  }
}
