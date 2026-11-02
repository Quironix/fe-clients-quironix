const FLOW_STOPS = [1, 2, 3, 4, 5];

export const QUIRON_VIEW_BOX = "-100 -100 200 200";

export const QuironGradient = ({ id }: { id: string }) => (
  <linearGradient
    id={id}
    gradientUnits="userSpaceOnUse"
    x1="-90"
    y1="90"
    x2="90"
    y2="-90"
  >
    {FLOW_STOPS.map((stop, index) => (
      <stop
        key={stop}
        offset={index / (FLOW_STOPS.length - 1)}
        style={{ stopColor: `var(--quiron-flow-${stop})` }}
      />
    ))}
  </linearGradient>
);
