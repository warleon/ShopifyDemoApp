import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createTransport } from "nodemailer";

const transport = createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ACCOUNT!,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET").send("Method Not Allowed");
  }
  const topLikes = await prisma.customer.findMany({
    orderBy: {
      totalLikes: "desc",
    },
    take: 10,
  });
  const topFollowers = await prisma.customer.findMany({
    orderBy: {
      totalFollowes: "desc",
    },
    take: 10,
  });
  console.log(topFollowers);
  console.log(topLikes);

  const receivers = topFollowers
    .concat(topLikes)
    .filter((v, i, a) => a.indexOf(v) === i);

  receivers.forEach((receiver) => {
    transport.sendMail({
      to: receiver.email,
      subject: "Congrats from Balto.fr",
      html: `Congrats ${
        receiver.name
      }! Ever since you became a Balto customer on ${receiver.signedUp.toDateString()}, you've gained ${
        receiver.totalLikes
      } likes and ${receiver.totalFollowes} follows.`,
    });
  });

  res.status(200).send("Ok");
}
