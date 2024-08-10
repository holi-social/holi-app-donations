import { assertEquals, describe, it } from "./dev_deps.ts";
import { exportedForTesting } from "./donations_db.ts";

describe("VolunteeringDB", () => {
  it("correctly constructs a query vector", () => {
    const expectedLength = 28 /* #topics */ + 50; /* #skills */
    // deno-fmt-ignore
    const expectedVector: number[] = [
            1,0,0,0,0,0,0,0,0,1,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,1,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
        ]
    // deno-fmt-ignore
    const actualVector = exportedForTesting.recosQueryVector([
        "agriculture-food",       // first item (index 0)
        "disabilities-inclusion", // tenth item (index 9)
        "water-ocean",            // last item  (index 27)
    ]);
    assertEquals(actualVector.length, expectedLength);
    assertEquals(actualVector, expectedVector);
  });
});
