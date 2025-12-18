import { getMenu, getOrderStatus } from "@/lib/redis";
import HomeContent from "@/components/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const menu = await getMenu();
  const orderStatus = await getOrderStatus();

  return <HomeContent menu={menu} orderStatus={orderStatus} />;
}
