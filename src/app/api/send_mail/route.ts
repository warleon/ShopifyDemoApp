import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, transport } from "@/global";
import { NextRequest, NextResponse } from "next/server";

// O(n^2) algorithm is acceptable because the size of data is at most n=20
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

export async function GET(req: NextRequest) {
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
  return NextResponse.json({ error: "OK" }, { status: 200 });
}
