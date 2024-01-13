import { shopify } from "@/globals";
//import "@shopify/shopify-api/adapters/node";
//import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";
//import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@shopify/shopify-api/adapters/node");
    const { shopifyApi, ApiVersion, Session } = await import(
      "@shopify/shopify-api"
    );
    const { restResources } = await import(
      "@shopify/shopify-api/rest/admin/2024-01"
    );

    console.log(
      "-------------------------------- running on the server --------------------------------"
    );
    shopify.push(
      shopifyApi({
        apiSecretKey: "gaaaa q no funco?", // Note: this is the API Secret Key, NOT the API access token
        apiVersion: ApiVersion.January24,
        isCustomStoreApp: true, // this MUST be set to true (default is false)
        adminApiAccessToken: "Admin_API_Access_Token", // Note: this is the API access token, NOT the API Secret Key
        isEmbeddedApp: false,
        hostName: "my-shop.myshopify.com",
        // Mount REST resources.
        restResources,
      })
    );
  }
}
