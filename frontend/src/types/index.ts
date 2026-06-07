export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  points_price: number;
  original_price: string;
  stock: number;
}

export interface FlashSaleItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  product_description: string;
  sale_points: number;
  original_points: number;
  total_stock: number;
  available_stock: number;
  sold_count: number;
  limit_per_user: number;
  sort_order: number;
}

export interface FlashSaleActivity {
  id: number;
  name: string;
  description: string;
  banner: string;
  start_time: string;
  end_time: string;
  status: string;
  status_text: string;
  created_by: string;
  created_at: string;
  server_time: string;
  items?: FlashSaleItem[];
}

export interface FlashSaleOrder {
  id: number;
  order_no: string;
  activity_id: number;
  activity_name: string;
  item_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  user_id: string;
  user_name: string;
  quantity: number;
  points_amount: number;
  status: string;
  status_text: string;
  locked_at: string;
  paid_at: string | null;
  expired_at: string | null;
  cancelled_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface UserAccount {
  user_id: string;
  user_name: string;
  points_balance: number;
}

export interface Winner {
  user_name: string;
  product_name: string;
  points_amount: number;
  paid_at: string;
  order_no: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
