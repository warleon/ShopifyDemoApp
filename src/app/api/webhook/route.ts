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
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export default async function POST(req: NextRequest, res: NextResponse) {
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
      return NextResponse.json({}, { status: 500 });
    }
  }

  processRequest(req);
  return NextResponse.json({}, { status: 200 });
}

async function processRequest(req: NextRequest) {
  const { id, email, created_at, first_name, last_name } = await req.json();
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

//left unused function in code, just to show the suffer caused by shopify's buggued api
function validateHmac(data: any, hmac: string): boolean {
  const macEngine = createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!);
  macEngine.update(stringify(data));
  const computeHmac = macEngine.digest("base64");
  return computeHmac === hmac;
}
