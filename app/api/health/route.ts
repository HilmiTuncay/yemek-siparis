import { NextResponse } from "next/server"; export async function GET() { return NextResponse.json({ status: "ok", env: process.env.UPSTASH_REDIS_REST_URL ? "set" : "missing" }); }
