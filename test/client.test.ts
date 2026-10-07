import { describe, expect, test } from "vitest";
import { HeywaitrClient } from "../src/api.js";
import { restaurantId } from "../src/types.js";
import { DEAD_RESTAURANT, LIVE_RESTAURANT, heywaitrFake } from "./heywaitr-fake.js";

describe("heywaitr client", () => {
  test("venue: live record parses with mixed-case tolerance", async () => {
    const fake = heywaitrFake();
    const client = new HeywaitrClient({ fetchImpl: fake.fetchImpl });
    const venue = await client.venue(LIVE_RESTAURANT);
    expect(venue).not.toBeNull();
    expect(venue?.name).toBe("Pizze Di Napo Hellerup");
    expect(venue?.currency.code).toBe("DKK");
    expect(venue?.serviceFee).toBe(1.25);
    expect(venue?.availability["Mon"]).toEqual({
      start: "10:00",
      end: "21:00",
      available: true,
    });
    expect(venue?.status).toBe("Closed");
    expect(venue?.openNow).toBe(false);
  });

  test("venue: 200-with-Message means absent → null (not throw)", async () => {
    const fake = heywaitrFake();
    const client = new HeywaitrClient({ fetchImpl: fake.fetchImpl });
    await expect(client.venue(DEAD_RESTAURANT)).resolves.toBeNull();
  });

  test("venue: request shape — POST with the id in the BODY", async () => {
    const fake = heywaitrFake();
    const client = new HeywaitrClient({ fetchImpl: fake.fetchImpl });
    await client.venue(LIVE_RESTAURANT);
    const call = fake.requests[0];
    expect(call.method).toBe("POST");
    expect(call.url.endsWith("/mobile/restaurant/fetchspecific")).toBe(true);
  });

  test("menu: integer main-unit prices, stamps normalized, oldPrice null when equal", async () => {
    const fake = heywaitrFake();
    const client = new HeywaitrClient({ fetchImpl: fake.fetchImpl });
    const menu = await client.menu(LIVE_RESTAURANT);
    expect(menu?.items).toHaveLength(3);
    const margharita = menu?.items[0];
    expect(margharita?.price).toBe(64);
    expect(margharita?.stamps).toBe(1);
    const diavola = menu?.items[1];
    expect(diavola?.oldPrice).toBe(95);
    const wine = menu?.items[2];
    expect(wine?.stamps).toBeNull();
    expect(wine?.oldPrice).toBeNull();
  });

  test("menu: reportedTotal disagrees with items.length — served data wins", async () => {
    const fake = heywaitrFake();
    const client = new HeywaitrClient({ fetchImpl: fake.fetchImpl });
    const menu = await client.menu(LIVE_RESTAURANT);
    expect(menu?.items.length).toBe(3);
    expect(menu?.reportedTotal).toBe(4);
  });

  test("menu: absent venue → null, no menu request fired", async () => {
    const fake = heywaitrFake();
    const client = new HeywaitrClient({ fetchImpl: fake.fetchImpl });
    await expect(client.menu(DEAD_RESTAURANT)).resolves.toBeNull();
    expect(fake.requests).toHaveLength(1);
  });

  test("id parser accepts bare ObjectId and restaurant URLs, rejects junk", () => {
    expect(restaurantId(LIVE_RESTAURANT)).toBe(LIVE_RESTAURANT);
    expect(
      restaurantId(`https://order.heywaitr.com/restaurants/${LIVE_RESTAURANT}/menu?isdinein=true`),
    ).toBe(LIVE_RESTAURANT);
    expect(() => restaurantId("https://favrit.com/x")).toThrow();
    expect(() => restaurantId("not-an-id")).toThrow();
  });

  test("transport failure throws HeywaitrError with reason network", async () => {
    const failing: typeof fetch = async () => {
      throw new Error("ECONNREFUSED");
    };
    const client = new HeywaitrClient({ fetchImpl: failing });
    await expect(client.venue(LIVE_RESTAURANT)).rejects.toMatchObject({
      name: "HeywaitrError",
      reason: "network",
    });
  });
});
