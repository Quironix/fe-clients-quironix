import { describe, expect, it } from "vitest";
import { blendCurves, Curve, tracePath } from "./quiron-curves";
import { LAZO_Q_PATH } from "./quiron-icon";
import { loaderPath } from "./quiron-loader";

const pointsOf = (path: string) =>
  path
    .replace(/Z$/, "")
    .split(/[ML]/)
    .filter(Boolean)
    .map((pair) => pair.split(" ").map(Number));

const staysInViewBox = (path: string) =>
  pointsOf(path)
    .flat()
    .every((value) => Math.abs(value) < 100);

const restsOnCircle = (path: string) =>
  pointsOf(path).every(([x, y]) => Math.abs(Math.hypot(x, y) - 65.6) < 0.02);

const unitCircle: Curve = (t) => [Math.cos(t), Math.sin(t)];
const origin: Curve = () => [0, 0];

describe("tracePath", () => {
  it("samples the curve from start to end as one polyline", () => {
    expect(tracePath(unitCircle, 0, Math.PI, 2)).toBe(
      "M1.00 0.00L0.00 1.00L-1.00 0.00",
    );
  });
});

describe("blendCurves", () => {
  it("interpolates point by point", () => {
    expect(blendCurves(origin, unitCircle, 0.5)(0)).toEqual([0.5, 0]);
  });
});

describe("LAZO_Q_PATH", () => {
  it("is a closed loop inside the viewBox", () => {
    const points = pointsOf(LAZO_Q_PATH);
    expect(LAZO_Q_PATH.endsWith("Z")).toBe(true);
    expect(points[0]).toEqual(points[points.length - 1]);
    expect(staysInViewBox(LAZO_Q_PATH)).toBe(true);
  });
});

describe("loaderPath", () => {
  it("rests on the circle at the start and after a full cycle", () => {
    expect(restsOnCircle(loaderPath(0))).toBe(true);
    expect(restsOnCircle(loaderPath(2.6 * 4))).toBe(true);
  });

  it("leaves the circle and stays inside the viewBox while morphing", () => {
    const morphing = loaderPath(2.3);
    expect(restsOnCircle(morphing)).toBe(false);
    expect(staysInViewBox(morphing)).toBe(true);
  });
});
