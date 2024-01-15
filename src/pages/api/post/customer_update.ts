import { Customer, Prisma, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

interface Media {
  customer_shopify_id: bigint;
  likes_gained_today: bigint;
  followers_gained_today: bigint;
}

const prisma = new PrismaClient();

function validate(data: Media) {
  if (
    data.customer_shopify_id === undefined ||
    data.followers_gained_today === undefined ||
    data.likes_gained_today === undefined
  )
    throw "";

  return data;
}

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
        totalFollowes: {
          increment: req.body.followers_gained_today,
        },
        totalLikes: {
          increment: req.body.likes_gained_today,
        },
      },
    });
  } catch (err) {
    res.status(400).send("Bad Request");
    return;
  }
  res.status(200).send("Ok");
}
