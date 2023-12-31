import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";

const frequency = (d: any) => d.value;

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  data: any[];
};

export function PieChart({
  width,
  height,
  margin = defaultMargin,
  data,
}: PieProps) {
  const getLetterFrequencyColor = scaleOrdinal({
    domain: data.map((l) => l.name),
    range: [
      "rgba(93,30,91,1)",
      "rgba(93,30,91,0.8)",
      "rgba(93,30,91,0.6)",
      "rgba(93,30,91,0.4)",
    ],
  });

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const top = centerY + margin.top;
  const left = centerX + margin.left;
  const pieSortValues = (a: number, b: number) => b - a;

  return (
    <svg width={width} height={height}>
      <Group top={top} left={left}>
        <Pie
          data={data}
          pieValue={frequency}
          pieSortValues={pieSortValues}
          outerRadius={radius}
        >
          {(pie) => {
            return pie.arcs.map((arc, index) => {
              const { name } = arc.data;
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
              const arcPath = pie.path(arc);
              const arcFill = getLetterFrequencyColor(name);
              return (
                <g key={`arc-${name}-${index}`}>
                  <path d={arcPath as string} fill={arcFill} />
                  {hasSpaceForLabel && (
                    <text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="#ffffff"
                      fontSize={22}
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {arc.data.name}
                    </text>
                  )}
                </g>
              );
            });
          }}
        </Pie>
      </Group>
    </svg>
  );
}
