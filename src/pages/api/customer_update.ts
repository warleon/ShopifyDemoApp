import { Customer } from "@prisma/client";
import { prisma } from "@/global";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").send("Method Not Allowed");
    return;
  }
  try {
    await prisma.customer.update({
      where: {
        id: req.body.customer_shopify_id,
      },
      data: {
        totalFollowers: {
          increment: req.body.followers_gained_today,
        },
        totalLikes: {
          increment: req.body.likes_gained_today,
        },
      },
    });
  } catch (err) {
    // prisma validates the data an fails if incorrect
    res.status(400).send("Bad Request");
    return;
  }
  res.status(200).send("Ok");
}
