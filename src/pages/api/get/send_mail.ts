import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, transport } from "@/global";

function getUniques(data: any[]) {
  let res: typeof data = [];
  let found = false;
  for (const customer of data) {
    found = false;
    for (const unique of res) {
      if (customer.id === unique.id) {
        found = true;
        break;
      }
    }
    if (found) continue;
    res.push(customer);
  }
  return res;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET").send("Method Not Allowed");
    return;
  }
  try {
    const topLikes = await prisma.customer.findMany({
      orderBy: {
        totalLikes: "desc",
      },
      take: 10,
    });
    const topFollowers = await prisma.customer.findMany({
      orderBy: {
        totalFollowers: "desc",
      },
      take: 10,
    });
    const receivers = getUniques(topFollowers.concat(topLikes));

    receivers.forEach((receiver) => {
      transport.sendMail({
        to: receiver.email,
        subject: "Congrats from Balto.fr",
        html: `Congrats ${
          receiver.name
        }! Ever since you became a Balto customer on ${receiver.signedUp.toDateString()}, you've gained ${
          receiver.totalLikes
        } likes and ${receiver.totalFollowers} follows.`,
      });
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
  res.status(200).send("Ok");
}
