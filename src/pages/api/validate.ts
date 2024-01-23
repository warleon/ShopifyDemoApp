import { NextApiRequest, NextApiResponse } from "next";
import { prisma, transport } from "@/global";
import jwt from "jsonwebtoken";
import ms from "ms";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const payload = await prisma.code.findUnique({
    where: {
      id: req.body.code,
    },
    select: {
      id: true,
      customer: true,
    },
  });
  if (!payload) {
    return res.status(403).send("");
  }
  const s_payload = JSON.stringify(payload, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );

  const webtoken = jwt.sign({ payload: s_payload }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
  return res
    .status(200)
    .appendHeader(
      "Set-Cookie",
      `jwt=${webtoken};Max-Age=${ms("1d") / ms("1s")};Secure;HttpOnly`
    )
    .send("");
}
