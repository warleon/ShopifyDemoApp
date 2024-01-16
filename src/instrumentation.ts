export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { fetchCustomers, shopify } = await import("@/global"); // initialize global objects [prisma,shopify]
    fetchCustomers(shopify);
  }
}
