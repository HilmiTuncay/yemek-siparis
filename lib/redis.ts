import { Redis } from "@upstash/redis";
import { Order, Menu, OrderSystemStatus, Suggestion } from "@/types";
import { defaultMenu } from "./menu";
import { unstable_noStore as noStore } from "next/cache";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://example.com",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "example_token",
});

const ORDERS_KEY = "yemek-siparisler";
const MENU_KEY = "yemek-menu";
const ORDER_STATUS_KEY = "yemek-siparis-status";
const SUGGESTIONS_KEY = "yemek-oneriler";
const TTL_SECONDS = 30 * 60; // 30 dakika (siparişler için)

// ==================== SİPARİŞ FONKSİYONLARI ====================

export async function getOrders(): Promise<Order[]> {
  noStore();
  if (!process.env.UPSTASH_REDIS_REST_URL) return [];
  try {
    const orders = await redis.get<Order[]>(ORDERS_KEY);
    return orders || [];
  } catch (error) {
    console.error("Redis getOrders error:", error);
    return [];
  }
}

export async function addOrder(order: Order): Promise<boolean> {
  noStore();
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
  noStore();
  try {
    await redis.del(ORDERS_KEY);
    return true;
  } catch (error) {
    console.error("Redis clearOrders error:", error);
    return false;
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  noStore();
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
  noStore();
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn("Redis URL missing, returning default menu");
    return defaultMenu;
  }
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
  noStore();
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
  noStore();
  try {
    await redis.set(MENU_KEY, defaultMenu);
    return true;
  } catch (error) {
    console.error("Redis resetMenu error:", error);
    return false;
  }
}

// ==================== SİPARİŞ DURUMU FONKSİYONLARI ====================

export async function getOrderStatus(): Promise<OrderSystemStatus> {
  noStore();
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return { isOpen: true };
  }
  try {
    const status = await redis.get<OrderSystemStatus>(ORDER_STATUS_KEY);
    return status || { isOpen: true };
  } catch (error) {
    console.error("Redis getOrderStatus error:", error);
    return { isOpen: true };
  }
}

export async function setOrderStatus(isOpen: boolean): Promise<boolean> {
  noStore();
  try {
    const status: OrderSystemStatus = {
      isOpen,
      closedAt: isOpen ? undefined : Date.now(),
    };
    await redis.set(ORDER_STATUS_KEY, status);
    return true;
  } catch (error) {
    console.error("Redis setOrderStatus error:", error);
    return false;
  }
}

// ==================== ÖNERİ FONKSİYONLARI ====================

export async function getSuggestions(): Promise<Suggestion[]> {
  noStore();
  if (!process.env.UPSTASH_REDIS_REST_URL) return [];
  try {
    const suggestions = await redis.get<Suggestion[]>(SUGGESTIONS_KEY);
    return suggestions || [];
  } catch (error) {
    console.error("Redis getSuggestions error:", error);
    return [];
  }
}

export async function addSuggestion(suggestion: Suggestion): Promise<boolean> {
  noStore();
  try {
    const suggestions = await getSuggestions();
    suggestions.push(suggestion);
    await redis.set(SUGGESTIONS_KEY, suggestions);
    return true;
  } catch (error) {
    console.error("Redis addSuggestion error:", error);
    return false;
  }
}

export async function voteSuggestion(suggestionId: string, voterName: string): Promise<boolean> {
  noStore();
  try {
    const suggestions = await getSuggestions();
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return false;

    // Zaten oy verdiyse kaldir, vermediyse ekle
    const voterIndex = suggestion.votes.indexOf(voterName);
    if (voterIndex >= 0) {
      suggestion.votes.splice(voterIndex, 1);
    } else {
      suggestion.votes.push(voterName);
    }

    await redis.set(SUGGESTIONS_KEY, suggestions);
    return true;
  } catch (error) {
    console.error("Redis voteSuggestion error:", error);
    return false;
  }
}

export async function deleteSuggestion(suggestionId: string): Promise<boolean> {
  noStore();
  try {
    const suggestions = await getSuggestions();
    const filtered = suggestions.filter(s => s.id !== suggestionId);
    await redis.set(SUGGESTIONS_KEY, filtered);
    return true;
  } catch (error) {
    console.error("Redis deleteSuggestion error:", error);
    return false;
  }
}

export async function clearSuggestions(): Promise<boolean> {
  noStore();
  try {
    await redis.del(SUGGESTIONS_KEY);
    return true;
  } catch (error) {
    console.error("Redis clearSuggestions error:", error);
    return false;
  }
}
