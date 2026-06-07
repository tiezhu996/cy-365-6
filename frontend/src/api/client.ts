import { API_BASE_URL } from "../constants/app";
import type {
  OverviewResponse,
  FlashSaleActivity,
  FlashSaleOrder,
  Product,
  UserAccount,
  Winner,
  ApiResponse,
} from "../types";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || data.error) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data.data as T;
}

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchActivities(status?: string): Promise<FlashSaleActivity[]> {
  const url = status
    ? `/flash-sale/activities?status=${status}`
    : "/flash-sale/activities";
  return request<FlashSaleActivity[]>(url);
}

export async function fetchActivityDetail(
  activityId: number
): Promise<FlashSaleActivity> {
  return request<FlashSaleActivity>(`/flash-sale/activities/${activityId}`);
}

export async function createActivity(data: {
  name: string;
  description?: string;
  banner?: string;
  start_time: string;
  end_time: string;
  items: Array<{
    product_id: number;
    sale_points: number;
    total_stock: number;
    limit_per_user?: number;
    sort_order?: number;
  }>;
}): Promise<FlashSaleActivity> {
  return request<FlashSaleActivity>("/flash-sale/activities/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActivity(
  activityId: number,
  data: Partial<{
    name: string;
    description: string;
    banner: string;
    start_time: string;
    end_time: string;
    items: Array<{
      product_id: number;
      sale_points: number;
      total_stock: number;
      limit_per_user?: number;
      sort_order?: number;
    }>;
  }>
): Promise<FlashSaleActivity> {
  return request<FlashSaleActivity>(
    `/flash-sale/activities/${activityId}/update`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function publishActivity(
  activityId: number
): Promise<FlashSaleActivity> {
  return request<FlashSaleActivity>(
    `/flash-sale/activities/${activityId}/publish`,
    {
      method: "POST",
    }
  );
}

export async function cancelActivity(
  activityId: number
): Promise<FlashSaleActivity> {
  return request<FlashSaleActivity>(
    `/flash-sale/activities/${activityId}/cancel`,
    {
      method: "POST",
    }
  );
}

export async function fetchProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

export async function createProduct(data: {
  name: string;
  description?: string;
  image?: string;
  points_price: number;
  original_price?: number;
  stock?: number;
}): Promise<Product> {
  return request<Product>("/products/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchUserAccount(): Promise<UserAccount> {
  return request<UserAccount>("/user/account");
}

export async function grabFlashSale(
  activityId: number,
  itemId: number
): Promise<FlashSaleOrder> {
  return request<FlashSaleOrder>(
    `/flash-sale/activities/${activityId}/items/${itemId}/grab`,
    {
      method: "POST",
    }
  );
}

export async function payOrder(orderId: number): Promise<FlashSaleOrder> {
  return request<FlashSaleOrder>(`/orders/${orderId}/pay`, {
    method: "POST",
  });
}

export async function cancelOrder(orderId: number): Promise<FlashSaleOrder> {
  return request<FlashSaleOrder>(`/orders/${orderId}/cancel`, {
    method: "POST",
  });
}

export async function expireOverdueOrders(): Promise<{ expired_count: number }> {
  return request<{ expired_count: number }>("/orders/expire-overdue", {
    method: "POST",
  });
}

export async function fetchUserOrders(): Promise<FlashSaleOrder[]> {
  return request<FlashSaleOrder[]>("/user/orders");
}

export async function fetchWinners(activityId: number): Promise<Winner[]> {
  return request<Winner[]>(
    `/flash-sale/activities/${activityId}/winners`
  );
}

export async function initDemoData(): Promise<{ message: string }> {
  return request<{ message: string }>("/init-demo-data", {
    method: "POST",
  });
}
