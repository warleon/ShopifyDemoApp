import "@shopify/shopify-api/adapters/node";
import {
  DeliveryMethod,
  Session,
  Shopify,
  shopifyApi,
  ApiVersion,
  LogSeverity,
} from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";

// cache object, one per api endpoint (as shown in response time)
var shopify: Shopify | null = null;
var session: Session | null = null;

export function getShopify() {
  if (shopify === null) {
    //code copied from the docs: https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/guides/custom-store-app.md
    //and then modified
    shopify = shopifyApi({
      adminApiAccessToken: process.env.SHOPIFY_ACCESS_TOKEN!, // Note: this is the API access token, NOT the API Secret Key
      apiKey: process.env.SHOPIFY_API_KEY!,
      apiSecretKey: process.env.SHOPIFY_API_SECRET!, // Note: this is the API Secret Key, NOT the API access token
      apiVersion: ApiVersion.January24,
      isCustomStoreApp: true, // this MUST be set to true (default is false)
      isEmbeddedApp: false,
      hostName: process.env.SHOPIFY_STORE_URL!,
      // Mount REST resources.
      restResources,
      logger: {
        level: LogSeverity.Debug,
        timestamps: true,
        httpRequests: true,
        log: async (severity, message) => {
          console.log(message.replace(/\\n/g, "\n").replace(/\\/g, ""));
        },
      },
    });
    console.log("--------------- Initialized Shopify API ---------------");
  }

  return shopify;
}

export function getSession() {
  if (session === null) {
    //code copied from the docs: https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/guides/custom-store-app.md
    //and then modified
    session = getShopify().session.customAppSession(
      process.env.SHOPIFY_STORE_URL!
    );
    console.log("--------------- Initialized Shopify Session ---------------");
  }

  return session;
}

export function createWebhooks() {
  getShopify().webhooks.addHandlers({
    CUSTOMERS_UPDATE: [
      {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: `${process.env.SHOPIFY_APP_URL}/api/webhook/customer_update`,
      },
    ],
  });
  let topics = getShopify().webhooks.getTopicsAdded();
  console.log(topics);
  getShopify().webhooks.register({ session: getSession() });
  topics = getShopify().webhooks.getTopicsAdded();
  console.log(topics);
  console.log("--------------- Initialized Shopify Webhooks ---------------");
}
