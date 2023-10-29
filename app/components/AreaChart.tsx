import { Group } from "@visx/group";
import { AreaClosed, Line, Bar } from "@visx/shape";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { LinearGradient, GradientOrangeRed } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import { useCallback, type ReactNode } from "react";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import type { ScaleLinear } from "@visx/vendor/d3-scale";
import { bisector } from "@visx/vendor/d3-array";

type Data = { year: number; physicians: number; actions: number };

// Initialize some variables
const axisColor = "#fff";
const axisBottomTickLabelProps = {
  textAnchor: "middle" as const,
  fontFamily: "Arial",
  fontSize: 10,
  fill: axisColor,
};
const axisLeftTickLabelProps = {
  dx: "-0.25em",
  dy: "0.25em",
  fontFamily: "Arial",
  fontSize: 10,
  textAnchor: "end" as const,
  fill: axisColor,
};

// accessors
const getXValue = (d: Data) => d.year;
const getYValue = (d: Data) => d.actions;
const getY2Value = (d: Data) => d.physicians;
const bisectDate = bisector<Data, number>((d) => d?.year).left;

export function AreaChart({
  data,
  gradientColor,
  width,
  height,
  yMax,
  margin,
  xScale,
  yScale,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  children,
}: {
  data: Data[];
  gradientColor: string;
  xScale: ScaleLinear<number, number, never>;
  yScale: ScaleLinear<number, number, never>;
  width: number;
  height: number;
  yMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  children?: ReactNode;
}) {
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip,
  } = useTooltip<Data>();
  const { containerRef } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });

  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      // Need to account for left margin
      let { x } = localPoint(event) || { x: margin.left };
      x -= margin.left;
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getXValue(d1)) {
        d =
          x0.valueOf() - getXValue(d0).valueOf() >
          getXValue(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(getYValue(d)),
      });
    },
    [data, margin.left, showTooltip, xScale, yScale]
  );

  if (width < 10) return null;
  return (
    <Group
      left={left || margin.left}
      top={top || margin.top}
      ref={containerRef}
    >
      <LinearGradient
        id="gradient"
        from={gradientColor}
        fromOpacity={1}
        to={gradientColor}
        toOpacity={0.2}
      />
      <AreaClosed<Data>
        data={data}
        x={(d) => xScale(getXValue(d)) || 0}
        y={(d) => yScale(getYValue(d)) || 0}
        yScale={yScale}
        strokeWidth={1}
        stroke="url(#gradient)"
        fill="url(#gradient)"
        curve={curveMonotoneX}
      />
      <GradientOrangeRed id="gradient2" fromOpacity={1} toOpacity={0.2} />
      <AreaClosed<Data>
        data={data}
        x={(d) => xScale(getXValue(d)) || 0}
        y={(d) => yScale(getY2Value(d)) || 0}
        yScale={yScale}
        strokeWidth={1}
        stroke="url(#gradient2)"
        fill="url(#gradient2)"
        curve={curveMonotoneX}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={Math.min(
            width > 520 ? 10 : 5,
            xScale.domain()[1] - xScale.domain()[0]
          )}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={axisBottomTickLabelProps}
          tickFormat={function tickFormat(d) {
            return String(d);
          }}
          // Show hovered year when tooltip is shown
          {...(tooltipData && {
            tickValues: [getXValue(tooltipData)],
          })}
          tickComponent={({ formattedValue, ...props }) => (
            <text
              {...props}
              fontSize={12}
              className={`${tooltipData && "font-bold text-base"}`}
            >
              {formattedValue}
            </text>
          )}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={Math.min(5, yScale.domain()[1] - yScale.domain()[0])}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={{
            ...axisLeftTickLabelProps,
          }}
          tickFormat={function tickFormat(d) {
            return String(d);
          }}
          {...(tooltipData && {
            tickValues: [getYValue(tooltipData), getY2Value(tooltipData)],
          })}
          tickComponent={({ formattedValue, ...props }) => (
            <text
              {...props}
              fontSize={12}
              className={`${tooltipData && "font-bold text-base"}`}
              {...(tooltipData && {
                dy:
                  Number(formattedValue) === getYValue(tooltipData) &&
                  Number(formattedValue) === getY2Value(tooltipData)
                    ? axisLeftTickLabelProps.dy
                    : Number(formattedValue) === getYValue(tooltipData)
                    ? "-1em"
                    : "1em",
              })}
            >
              <tspan x="-8">{formattedValue}</tspan>
              {tooltipData && (
                <tspan x="-8" dy=".9em" className="text-xs font-normal">
                  {Number(formattedValue) === getYValue(tooltipData) &&
                  Number(formattedValue) === getY2Value(tooltipData)
                    ? ""
                    : Number(formattedValue) === getYValue(tooltipData)
                    ? "actions"
                    : "doctors"}
                </tspan>
              )}
            </text>
          )}
        />
      )}

      {/* Invisible box so tooltip shows even not over AreaClosed */}
      <Bar
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        rx={14}
        onTouchStart={handleTooltip}
        onTouchMove={handleTooltip}
        onMouseMove={handleTooltip}
        onMouseLeave={hideTooltip}
        onTouchEnd={hideTooltip}
        // Attempt to fix mobile buggy case
        onTouchCancel={hideTooltip}
      />

      {/* Line and dot tooltip looks like it stems from */}
      {tooltipData && (
        <g>
          <Line
            from={{
              x: tooltipLeft,
              y: tooltipTop,
            }}
            to={{
              x: tooltipLeft,
              y: height,
            }}
            stroke={axisColor}
            strokeWidth={2}
            pointerEvents="none"
            strokeDasharray="5,2"
          />

          <Line
            from={{
              x: 0,
              y: tooltipTop,
            }}
            to={{
              x: tooltipLeft,
              y: tooltipTop,
            }}
            stroke={axisColor}
            strokeWidth={2}
            pointerEvents="none"
            strokeDasharray="5,2"
          />
          <circle
            cx={tooltipLeft}
            cy={tooltipTop + 1}
            r={4}
            fill="black"
            fillOpacity={0.1}
            stroke="black"
            strokeOpacity={0.1}
            strokeWidth={2}
            pointerEvents="none"
          />
          <circle
            cx={tooltipLeft}
            cy={tooltipTop}
            r={4}
            fill={gradientColor}
            stroke="white"
            strokeWidth={2}
            pointerEvents="none"
          />

          <Line
            from={{
              x: 0,
              y: yScale(getY2Value(tooltipData)),
            }}
            to={{
              x: tooltipLeft,
              y: yScale(getY2Value(tooltipData)),
            }}
            stroke={axisColor}
            strokeWidth={2}
            pointerEvents="none"
            strokeDasharray="5,2"
          />
          <circle
            cx={tooltipLeft}
            cy={yScale(getY2Value(tooltipData)) + 1}
            r={4}
            fill="black"
            fillOpacity={0.1}
            stroke="black"
            strokeOpacity={0.1}
            strokeWidth={2}
            pointerEvents="none"
          />
          <circle
            cx={tooltipLeft}
            cy={yScale(getY2Value(tooltipData))}
            r={4}
            // https://airbnb.io/visx/docs/gradient#GradientOrangeRed
            fill={"#FCE38A"}
            stroke="white"
            strokeWidth={2}
            pointerEvents="none"
          />
        </g>
      )}
      {/* Tooltip */}
      {/* Tooltip goes out of chart, also may not be needed with x and y axis modifications */}
      {/* {tooltipData && (
        <div>
          <TooltipInPortal
            key={Math.random()}
            // https://github.com/airbnb/visx/issues/1392
            top={tooltipTop + 270}
            left={tooltipLeft + 120}
            className="popover absolute"
            // Otherwise className is overriden
            style={{}}
          >
            {getYValue(tooltipData) || 0} actions
          </TooltipInPortal>
        </div>
      )} */}
      {children}
    </Group>
  );
}
