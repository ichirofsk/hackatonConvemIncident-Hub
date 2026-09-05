import { describe, expect, it } from "vitest";
import { applicationMetadata } from "../src/shared/applicationMetadata";

describe("initial project structure", () => {
  it("exposes the application identity", () => {
    expect(applicationMetadata.name).toBe("Incident Hub");
  });
});
