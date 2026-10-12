export type Point = readonly [number, number];
export type Curve = (t: number) => Point;

export const FULL_TURN = 2 * Math.PI;

export const scaleCurve =
  (curve: Curve, radius: number): Curve =>
  (t) => {
    const [x, y] = curve(t);
    return [x * radius, y * radius];
  };

export const blendCurves =
  (from: Curve, to: Curve, weight: number): Curve =>
  (t) => {
    const [fromX, fromY] = from(t);
    const [toX, toY] = to(t);
    return [fromX + (toX - fromX) * weight, fromY + (toY - fromY) * weight];
  };

export const tracePath = (
  curve: Curve,
  start: number,
  end: number,
  segments: number,
): string =>
  Array.from({ length: segments + 1 }, (_, index) => {
    const [x, y] = curve(start + ((end - start) * index) / segments);
    return `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join("");
