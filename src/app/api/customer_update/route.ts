import { Customer } from "@prisma/client";
import { prisma } from "@/global";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  try {
    await prisma.customer.update({
      where: {
        id: body.customer_shopify_id,
      },
      data: {
        totalFollowers: {
          increment: body.followers_gained_today,
        },
        totalLikes: {
          increment: body.likes_gained_today,
        },
      },
    });
  } catch {
    // prisma validates the data an fails if incorrect
    return NextResponse.json({}, { status: 400 });
  }
  return NextResponse.json({}, { status: 200 });
}
