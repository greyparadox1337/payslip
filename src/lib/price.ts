const CACHE_KEY = "payslip_eth_price";
const CHART_CACHE_KEY = "payslip_eth_chart";
const CACHE_DURATION_MS = 60000; // 60 seconds
const FALLBACK_PRICE = 3000;

export async function fetchETHPrice(): Promise<number> {
  if (typeof window === "undefined") return FALLBACK_PRICE;

  const cachedStr = localStorage.getItem(CACHE_KEY);
  if (cachedStr) {
    try {
      const cached = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.price;
      }
    } catch {
      // invalid cache formatting
    }
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    if (!res.ok) throw new Error("API Limit Reached");

    const data = await res.json();
    const price = data?.ethereum?.usd || FALLBACK_PRICE;

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ price, timestamp: Date.now() })
    );

    return price;
  } catch (error) {
    console.error("CoinGecko Fetch failed. Resorting to fallback:", error);

    // Attempt to retain stale cache if possible
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr);
        return cached.price;
      } catch {}
    }

    return FALLBACK_PRICE;
  }
}

export async function fetchETHHistory(): Promise<{ timestamp: number; price: number }[]> {
  if (typeof window === "undefined") return [];

  const cachedStr = localStorage.getItem(CHART_CACHE_KEY);
  if (cachedStr) {
    try {
      const cached = JSON.parse(cachedStr);
      // Cache history for 5 minutes since it's an expensive 7-day endpoint
      if (Date.now() - cached.timestamp < 300000) {
        return cached.history;
      }
    } catch {}
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7"
    );
    if (!res.ok) throw new Error("History API Limit");

    const data = await res.json();
    const history = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));

    localStorage.setItem(
      CHART_CACHE_KEY,
      JSON.stringify({ history, timestamp: Date.now() })
    );

    return history;
  } catch (error) {
    console.error("Failed to load historical charts:", error);

    // Provide a mocked declining/ascending line so UI doesn't break if API blocks us
    const mock = Array.from({ length: 7 }).map((_, i) => ({
      timestamp: Date.now() - ((7 - i) * 86400000),
      price: FALLBACK_PRICE * (1 + (Math.random() * 0.04 - 0.02)),
    }));
    return mock;
  }
}
