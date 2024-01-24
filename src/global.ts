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

declare global {
  var prisma: undefined | PrismaClient;
  var shopify: undefined | Shopify;
}

export const prisma = globalThis.prisma ?? new PrismaClient();
globalThis.prisma = prisma;

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
        callbackUrl: `${process.env.SHOPIFY_APP_URL}/api/webhook`,
      },
    ],
  });
  const session = api.session.customAppSession(process.env.SHOPIFY_STORE_URL!);
  api.webhooks.register({
    session: session,
  });
  return api;
}

export const shopify = globalThis.shopify ?? createShopify();
globalThis.shopify = shopify;

export async function fetchCustomers(api: Shopify) {
  console.log("Fetching users");
  const session = api.session.customAppSession(process.env.SHOPIFY_STORE_URL!);
  let pageInfo;
  do {
    const response: any = await api.rest.Customer.all({
      ...pageInfo?.nextPage?.query,
      session: session,
      limit: 10,
    });

    for (const customer of response.data) {
      const data = {
        id: customer.id,
        email: customer.email,
        signedUp: customer.created_at,
        name: `${customer.first_name} ${customer.last_name}`,
      };
      try {
        await prisma.customer.create({ data: data });
      } catch {
        // fails if costumer already exists
        // occurs when app is redeployed
      }
    }

    pageInfo = response.pageInfo;
  } while (pageInfo?.nextPage);
}
