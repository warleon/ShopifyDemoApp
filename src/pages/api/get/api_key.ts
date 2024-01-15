import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET").send("Method Not Allowed");
  }

  const apiKey = { apiKey: randomBytes(256).toString("base64") };
  let User = await prisma.user.create({ data: apiKey });
  if (User) res.status(201).send(User);
  else res.status(500).send("Internal Server Error");
}
