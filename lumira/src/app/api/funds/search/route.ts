/**
 * API: 搜索基金
 * 
 * Agent: backend-engineer
 * 从天天基金搜索基金信息
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, Fund } from "@/types";
import { searchFundsFromEastMoney } from "@/lib/eastmoney-api";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Fund[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({
        success: false,
        error: { code: "INVALID_PARAMS", message: "缺少搜索关键词" }
      }, { status: 400 });
    }

    // 调用天天基金API
    const funds = await searchFundsFromEastMoney(query);

    return NextResponse.json({
      success: true,
      data: funds,
      meta: { 
        cached: false, 
        timestamp: new Date().toISOString(),
        source: "eastmoney",
        count: funds.length
      }
    });

  } catch (error) {
    console.error("搜索基金失败:", error);
    return NextResponse.json({
      success: false,
      error: { 
        code: "API_ERROR", 
        message: (error as Error).message 
      }
    }, { status: 500 });
  }
}
