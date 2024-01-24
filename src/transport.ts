import { Transporter, createTransport } from "nodemailer";

declare global {
  var transport: undefined | Transporter;
}
export const transport =
  globalThis.transport ??
  createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ACCOUNT!,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
globalThis.transport = transport;
