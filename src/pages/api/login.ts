import { NextApiRequest, NextApiResponse } from "next";
import { prisma, transport } from "@/global";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: req.body.email,
    },
    select: {
      email: true,
      id: true,
      code: true,
    },
  });
  if (!customer) {
    return res.status(403).send("");
  }
  if (customer.code) {
    return res.status(409).send("");
  }
  const genCode = crypto.randomBytes(3).toString("hex");

  const code = await prisma.code.create({
    data: {
      id: genCode,
      customerId: customer.id,
    },
  });

  transport.sendMail({
    to: customer.email,
    subject: "Validation Code",
    html: `Code: ${code.id}. Enter this code to finish the login proccess`,
  });

  res.redirect("/validate");
}
