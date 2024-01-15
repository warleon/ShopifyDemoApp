import "@shopify/shopify-api/adapters/node";
import {
  DeliveryMethod,
  Shopify,
  shopifyApi,
  ApiVersion,
  LogSeverity,
} from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import { PrismaClient } from "@prisma/client";

function createShopify() {
  const api = shopifyApi({
    adminApiAccessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    apiVersion: ApiVersion.January24,
    isCustomStoreApp: true,
    isEmbeddedApp: false,
    hostName: process.env.SHOPIFY_STORE_URL!,
    restResources,
    logger:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            level: LogSeverity.Debug,
            timestamps: true,
            httpRequests: true,
            log: async (severity, message) => {
              console.log(message.replace(/\\n/g, "\n").replace(/\\/g, ""));
            },
          },
    scopes: ["read_customers"],
  });
  api.webhooks.addHandlers({
    CUSTOMERS_UPDATE: [
      {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: `${process.env.SHOPIFY_APP_URL}/api/webhook/customer_update`,
      },
    ],
  });
  api.webhooks.register({
    session: api.session.customAppSession(process.env.SHOPIFY_STORE_URL!),
  });
  return api;
}

declare global {
  var prisma: undefined | PrismaClient;
  var shopify: undefined | Shopify;
}

export const prisma = globalThis.prisma ?? new PrismaClient();
globalThis.prisma = prisma;

export const shopify = globalThis.shopify ?? createShopify();
globalThis.shopify = shopify;
