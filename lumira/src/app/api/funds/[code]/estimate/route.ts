/**
 * API: 获取基金实时估值
 * 
 * Agent: backend-engineer
 * Skills: fund-data-fetch
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, FundEstimate } from "@/types";
import { getFundEstimateFromEastMoney } from "@/lib/eastmoney-api";

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
): Promise<NextResponse<ApiResponse<FundEstimate>>> {
  try {
    const { code } = params;

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json({
        success: false,
        error: { 
          code: "INVALID_PARAMS", 
          message: "基金代码格式错误，应为6位数字" 
        }
      }, { status: 400 });
    }

    // 调用天天基金估值API
    const estimate = await getFundEstimateFromEastMoney(code);

    return NextResponse.json({
      success: true,
      data: estimate,
      meta: { 
        cached: false, 
        timestamp: new Date().toISOString(),
        source: "eastmoney"
      }
    });

  } catch (error) {
    console.error(`获取基金 ${params.code} 估值失败:`, error);
    return NextResponse.json({
      success: false,
      error: { 
        code: "API_ERROR", 
        message: (error as Error).message 
      }
    }, { status: 500 });
  }
}
