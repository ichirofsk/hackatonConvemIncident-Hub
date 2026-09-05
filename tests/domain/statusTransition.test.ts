import { describe, expect, it } from "vitest";
import { assertStatusTransition, isStatusTransitionAllowed } from "../../src/domain/incident/statusTransition";

describe("status transitions", () => {
  it("blocks a Critical incident from moving directly from Open to Resolved", () => {
    expect(() => assertStatusTransition("Critical", "Open", "Resolved")).toThrow(
      "A transição de Open para Resolved não é permitida para um incidente Critical.",
    );
  });

  it("allows a Critical incident to move through In Progress before resolution", () => {
    expect(isStatusTransitionAllowed("Critical", "Open", "In Progress")).toBe(true);
    expect(isStatusTransitionAllowed("Critical", "In Progress", "Resolved")).toBe(true);
  });
});
