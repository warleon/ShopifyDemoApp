export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { createWebhooks } = await import("@/global");
    createWebhooks();
  }
}
