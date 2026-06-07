import { localFeatures, localKpis, operationRecords } from "../data/workbench";
import type { OverviewResponse } from "../types";
import { APP_CODE, APP_NAME } from "../constants/app";

export function createFallbackOverview(): OverviewResponse {
  return {
    appName: APP_NAME,
    appCode: APP_CODE,
    description: "面向企业HR部门，提供员工福利积分发放、积分商城兑换和福利账单管理的一站式平台。",
    features: localFeatures,
    kpis: localKpis,
    records: operationRecords,
  };
}
