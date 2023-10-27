import { useRef, useState, useMemo, useEffect } from "react";
import { scaleLinear } from "@visx/scale";
import { Brush } from "@visx/brush";
import type { Bounds } from "@visx/brush/lib/types";
import type { BaseBrushState, UpdateBrush } from "@visx/brush/lib/BaseBrush";
import type BaseBrush from "@visx/brush/lib/BaseBrush";
import { PatternLines } from "@visx/pattern";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { max, extent } from "@visx/vendor/d3-array";
import type { BrushHandleRenderProps } from "@visx/brush/lib/BrushHandle";
import { AreaChart } from "./AreaChart";

const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
const GRADIENT_ID = "brush_gradient";
export const accentColor = "#f6acc8";
export const background = "#584153";
export const background2 = "#af8baf";
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: "white",
};

type Data = { year: number; actions: number; physicians: number };

// accessors
const getXValue = (d: Data) => d?.year;
const getYValue = (d: Data) => d.actions;

export type BrushProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
  isCompact?: boolean;
  data: Data[];
  width: number;
  height: number;
};

export function BrushChart({
  width,
  height,
  isCompact = false,
  margin = {
    top: 20,
    left: 50,
    bottom: 20,
    right: 20,
  },
  data,
}: BrushProps) {
  const [filteredData, setFilteredData] = useState(data);
  // Otherwise does not rerender when another filter changes the data
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Top chart
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = isCompact
    ? chartSeparation / 2
    : chartSeparation + 10;
  // const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const topChartHeight = 0.95 * innerHeight;
  const xMax = Math.max(innerWidth, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, xMax],
        domain: extent(filteredData, getXValue) as [number, number],
      }),
    [xMax, filteredData]
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredData, getYValue) || 0],
        nice: true,
      }),
    [yMax, filteredData]
  );

  // const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;
  // const bottomChartHeight = 0;

  // bounds

  // const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  // const yBrushMax = Math.max(
  //   bottomChartHeight - brushMargin.top - brushMargin.bottom,
  //   0
  // );

  // const brushRef = useRef<BaseBrush | null>(null);

  // scales

  // const brushDateScale = useMemo(
  //   () =>
  //     scaleLinear<number>({
  //       range: [0, xBrushMax],
  //       domain: extent(data, getXValue) as [Date, Date],
  //     }),
  //   [data, xBrushMax]
  // );
  // const brushStockScale = useMemo(
  //   () =>
  //     scaleLinear({
  //       range: [yBrushMax, 0],
  //       domain: [0, max(data, getYValue) || 0],
  //       nice: true,
  //     }),
  //   [data, yBrushMax]
  // );

  // const initialBrushPosition = useMemo(
  //   () => ({
  //     start: { x: brushDateScale(getXValue(data[50])) },
  //     end: { x: brushDateScale(getXValue(data.at(-1))) },
  //   }),
  //   [brushDateScale, data]
  // );

  // event handlers
  // const handleClearClick = () => {
  //   if (brushRef?.current) {
  //     setFilteredData(data);
  //     brushRef.current.reset();
  //   }
  // };

  // const handleResetClick = () => {
  //   if (brushRef?.current) {
  //     const updater: UpdateBrush = (prevBrush) => {
  //       const newExtent = brushRef.current!.getExtent(
  //         initialBrushPosition.start,
  //         initialBrushPosition.end
  //       );

  //       const newState: BaseBrushState = {
  //         ...prevBrush,
  //         start: { y: newExtent.y0, x: newExtent.x0 },
  //         end: { y: newExtent.y1, x: newExtent.x1 },
  //         extent: newExtent,
  //       };

  //       return newState;
  //     };
  //     brushRef.current.updateBrush(updater);
  //   }
  // };

  // const onBrushChange = (domain: Bounds | null) => {
  //   if (!domain) return;
  //   const { x0, x1, y0, y1 } = domain;
  //   const stockCopy = data.filter((s) => {
  //     const x = getXValue(s);
  //     const y = getYValue(s);
  //     return x > x0 && x < x1 && y > y0 && y < y1;
  //   });
  //   setFilteredData(stockCopy);
  // };

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient
          id={GRADIENT_ID}
          from={background}
          to={background2}
          rotate={45}
        />
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={`url(#${GRADIENT_ID})`}
          rx={14}
        />
        <AreaChart
          hideBottomAxis={isCompact}
          data={filteredData}
          width={innerWidth}
          height={topChartHeight}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          yMax={yMax}
          xScale={xScale}
          yScale={yScale}
          gradientColor={background2}
        />
        {/* <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={data}
          width={width}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={background2}
        >
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={["diagonal"]}
          />
          <Brush
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={["left", "right"]}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={() => setFilteredData(data)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
            renderBrushHandle={(props) => <BrushHandle {...props} />}
          />
        </AreaChart> */}
      </svg>
      {/* <button onClick={handleClearClick}>Clear</button>&nbsp;
      <button onClick={handleResetClick}>Reset</button> */}
    </div>
  );
}
// We need to manually offset the handles for them to be rendered at the right position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill="#f2f2f2"
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: "ew-resize" }}
      />
    </Group>
  );
}
