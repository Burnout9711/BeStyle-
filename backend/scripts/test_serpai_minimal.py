# scripts/test_serpapi_minimal.py
import asyncio
from ..services.serpapi_provider import SerpApiShoppingProvider

async def main():
    p = SerpApiShoppingProvider()
    qs = [
        "H&M Regular Fit Cotton T-shirt UAE",
        "Zara Straight Leg Trousers UAE",
        "Parfois Minimalist Crossbody Bag UAE",
        "Truffle Collection White Flat Lace-up Sneakers UAE",
    ]
    for q in qs:
        res = await p.search(q, price_min=50, price_max=200)  # ints
        print(q, " -> ", len(res), "results")
        for r in res[:3]:
            print("  -", r.title[:60], "|", r.price, r.currency, "|", r.url)

if __name__ == "__main__":
    asyncio.run(main())
