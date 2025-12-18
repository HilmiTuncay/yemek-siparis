import { Redis } from "@upstash/redis";
import { Order, Menu } from "@/types";
import { defaultMenu } from "./menu";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ORDERS_KEY = "yemek-siparisler";
const MENU_KEY = "yemek-menu";
const TTL_SECONDS = 30 * 60; // 30 dakika (siparişler için)

// ==================== SİPARİŞ FONKSİYONLARI ====================

export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await redis.get<Order[]>(ORDERS_KEY);
    return orders || [];
  } catch (error) {
    console.error("Redis getOrders error:", error);
    return [];
  }
}

export async function addOrder(order: Order): Promise<boolean> {
  try {
    const orders = await getOrders();
    orders.push(order);
    await redis.set(ORDERS_KEY, orders, { ex: TTL_SECONDS });
    return true;
  } catch (error) {
    console.error("Redis addOrder error:", error);
    return false;
  }
}

export async function clearOrders(): Promise<boolean> {
  try {
    await redis.del(ORDERS_KEY);
    return true;
  } catch (error) {
    console.error("Redis clearOrders error:", error);
    return false;
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    const orders = await getOrders();
    const filteredOrders = orders.filter((o) => o.id !== orderId);
    if (filteredOrders.length === orders.length) {
      return false;
    }
    await redis.set(ORDERS_KEY, filteredOrders, { ex: TTL_SECONDS });
    return true;
  } catch (error) {
    console.error("Redis deleteOrder error:", error);
    return false;
  }
}

// ==================== MENÜ FONKSİYONLARI ====================

export async function getMenu(): Promise<Menu> {
  try {
    const menu = await redis.get<Menu>(MENU_KEY);
    if (menu) {
      return menu;
    }
    // Menü yoksa varsayılanı kaydet ve döndür
    await saveMenu(defaultMenu);
    return defaultMenu;
  } catch (error) {
    console.error("Redis getMenu error:", error);
    return defaultMenu;
  }
}

export async function saveMenu(menu: Menu): Promise<boolean> {
  try {
    menu.updatedAt = Date.now();
    await redis.set(MENU_KEY, menu);
    return true;
  } catch (error) {
    console.error("Redis saveMenu error:", error);
    return false;
  }
}

export async function resetMenu(): Promise<boolean> {
  try {
    await redis.set(MENU_KEY, defaultMenu);
    return true;
  } catch (error) {
    console.error("Redis resetMenu error:", error);
    return false;
  }
}
