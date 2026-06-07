OVERVIEW = {
  "appName": "企业福利积分商城系统",
  "appCode": "ldwelfaremall",
  "description": "面向企业HR部门，提供员工福利积分发放、积分商城兑换和福利账单管理的一站式平台。",
  "features": [
    {
      "id": 1,
      "title": "积分发放规则配置",
      "description": "HR配置积分获取规则，如考勤全勤、绩效优秀、入职周年、节日福利等，系统自动计算并发放积分到员工账户。",
      "status": "已上线",
      "metric": "88%"
    },
    {
      "id": 2,
      "title": "积分商城商品上架",
      "description": "管理员上架可兑换商品（实物/虚拟卡券/服务），设置所需积分、库存数量和兑换限制（如每人限兑数量）。",
      "status": "排期中",
      "metric": "31 单"
    },
    {
      "id": 3,
      "title": "秒杀与限时兑换",
      "description": "设置限时秒杀活动，指定活动时段和库存，员工在活动期间抢购，先到先得，增强福利趣味性。",
      "status": "巡检中",
      "metric": "10 项"
    },
    {
      "id": 4,
      "title": "积分抽奖转盘",
      "description": "员工消耗积分参与抽奖，配置奖项概率和奖品池（积分/实物/谢谢参与），记录每次抽奖结果和中奖名单。",
      "status": "优化中",
      "metric": "4 级"
    },
    {
      "id": 5,
      "title": "订单发货与福利账单",
      "description": "兑换成功后生成订单，管理员处理发货并更新物流状态，HR可查看月度福利积分支出账单和兑换统计。",
      "status": "可导出",
      "metric": "28 条"
    }
  ],
  "kpis": [
    {
      "label": "今日处理",
      "value": "104",
      "trend": "+12%",
      "tone": "primary"
    },
    {
      "label": "预约/订单",
      "value": "40",
      "trend": "+8%",
      "tone": "warm"
    },
    {
      "label": "履约率",
      "value": "92%",
      "trend": "+3%",
      "tone": "cool"
    },
    {
      "label": "待处理",
      "value": "9",
      "trend": "需跟进",
      "tone": "neutral"
    }
  ],
  "records": [
    {
      "key": "ldwelfaremall-1",
      "name": "积分发放规则配置",
      "owner": "运营组",
      "status": "已上线",
      "metric": "88%",
      "priority": "高"
    },
    {
      "key": "ldwelfaremall-2",
      "name": "积分商城商品上架",
      "owner": "管理员",
      "status": "排期中",
      "metric": "31 单",
      "priority": "中"
    },
    {
      "key": "ldwelfaremall-3",
      "name": "秒杀与限时兑换",
      "owner": "服务台",
      "status": "巡检中",
      "metric": "10 项",
      "priority": "低"
    },
    {
      "key": "ldwelfaremall-4",
      "name": "积分抽奖转盘",
      "owner": "财务组",
      "status": "优化中",
      "metric": "4 级",
      "priority": "高"
    },
    {
      "key": "ldwelfaremall-5",
      "name": "订单发货与福利账单",
      "owner": "审核组",
      "status": "可导出",
      "metric": "28 条",
      "priority": "中"
    }
  ]
}

def get_overview():
    return OVERVIEW
