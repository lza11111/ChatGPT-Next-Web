import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../common";
import { DbClient } from "../dbclient";

async function makeRequest(req: NextRequest) {
  try {
    const token = req.headers.get("token");
    const balance = await DbClient.queryBalance(token!);
    if (!balance) {
      throw new Error("Invalid token");
    }
    const res = NextResponse.json({
      used: balance.used,
      subscription: balance.subscription,
    });
    res.headers.set("Content-Type", "application/json");
    res.headers.set("Cache-Control", "no-cache");
    return res;
  } catch (e) {
    console.error("[OpenAI] ", req.body, e);
    return NextResponse.json(
      {
        error: true,
        msg: JSON.stringify(e),
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(req: NextRequest) {
  return makeRequest(req);
}
