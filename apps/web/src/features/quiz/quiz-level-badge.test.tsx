import { describe, expect, test } from "bun:test";
import { SessionLevelBadge } from "./quiz-level-badge";

describe("SessionLevelBadge #33", () => {
  test("latihan (level undefined) → badge disembunyikan", () => {
    expect(SessionLevelBadge({ level: undefined })).toBeNull();
  });

  test("level di luar 1-3 → badge disembunyikan", () => {
    expect(SessionLevelBadge({ level: 0 })).toBeNull();
    expect(SessionLevelBadge({ level: 4 })).toBeNull();
  });

  test("level sesi valid → render badge Level", () => {
    const el = SessionLevelBadge({ level: 2 }) as unknown as {
      props: { children: string; ["aria-label"]: string };
    };
    expect(el.props.children).toBe("Level 2");
    expect(el.props["aria-label"]).toBe("Level 2");
  });
});
