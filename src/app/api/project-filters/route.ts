import { NextResponse } from "next/server";

import { getPublicProjectFilterOptionsService } from "@/features/projects/services/project-filter-options.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await getPublicProjectFilterOptionsService();

    if (result.error) {
      return NextResponse.json(
        { error: result.error, data: result.options },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: result.options }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
