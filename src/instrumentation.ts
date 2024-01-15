export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/global"); // initialize global objects [prisma,shopify]
  }
}
