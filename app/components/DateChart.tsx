import { useEffect, useId, useState } from "react";
import {
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type InitialState = {
  data: any;
  left?: string;
  right?: string;
  refAreaLeft?: string;
  refAreaRight?: string;
  top: string | number;
  bottom: string | number;
  top2: string | number;
  bottom2: string | number;
  animation: boolean;
};

type DataType = { year: number; actions: number; physicians: number };

// https://github.com/recharts/recharts/issues/3369#issuecomment-1432203138
export const DateChart = ({
  data: initialData,
  setBeginning,
  setEnding,
  initialBeginning,
  initialEnding,
}: {
  data: DataType[];
  setBeginning: (_a: number) => void;
  setEnding: (_a: number) => void;
  initialBeginning?: number;
  initialEnding?: number;
}) => {
  // TODO zoom when visiting a url with a beginning and end not working
  const id = useId();

  const getAxisYDomain = (
    from: any,
    to: any,
    ref: keyof DataType,
    offset: number
  ) => {
    // console.log(from, to, ref, offset);
    // This was assuming x axis starts at 0 instead of years
    const refData = initialData.slice(
      from - initialData[0].year - 1,
      to - initialData[0].year
    );
    // console.log(refData);

    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });

    return [(bottom | 0) - offset, (top | 0) + offset];
  };

  const initialState: InitialState = {
    data: initialData,
    left: initialBeginning ? initialBeginning : "dataMin",
    right: initialEnding ? initialEnding : "dataMax",
    refAreaLeft: "",
    refAreaRight: "",
    top: "dataMax+20",
    bottom: "dataMin-20",
    top2: "dataMax+20",
    bottom2: "dataMin-20",
    animation: true,
  };

  const [zoomGraph, setZoomGraph] = useState<InitialState>(initialState);

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomGraph;
    const { data } = zoomGraph;

    if (refAreaLeft === refAreaRight || refAreaRight === "") {
      setZoomGraph((prev) => ({
        ...prev,
        refAreaLeft: "",
        refAreaRight: "",
      }));
      return;
    }

    // xAxis domain
    if (refAreaLeft && refAreaRight && refAreaLeft > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(
      refAreaLeft,
      refAreaRight,
      "physicians",
      50
    );
    const [bottom2, top2] = getAxisYDomain(
      refAreaLeft,
      refAreaRight,
      "actions",
      50
    );

    setZoomGraph((prev) => ({
      ...prev,
      refAreaLeft: "",
      refAreaRight: "",
      data: data?.slice(),
      left: refAreaLeft,
      right: refAreaRight,
      bottom,
      top,
      bottom2,
      top2,
    }));
  };

  const zoomOut = () => {
    const { data } = zoomGraph;
    setZoomGraph((prev) => ({
      ...prev,
      data: data?.slice(),
      refAreaLeft: "",
      refAreaRight: "",
      left: "dataMin",
      right: "dataMax",
      top: "dataMax+50",
      bottom: "dataMin+50",
      top2: "dataMax+50",
      bottom2: "dataMin+50",
    }));
    setBeginning(0);
    setEnding(0);
  };

  const {
    data,
    left,
    right,
    refAreaLeft,
    refAreaRight,
    top,
    bottom,
    top2,
    bottom2,
  } = zoomGraph;
  // console.log(zoomGraph);

  // console.log({ left, right });

  const beginning = left === "dataMin" ? 0 : left;
  const ending = right === "dataMax" ? 0 : right;
  useEffect(() => {
    setBeginning(beginning);
  }, [beginning, setBeginning]);
  useEffect(() => {
    setEnding(ending);
  }, [ending, setEnding]);

  return (
    <div className="select-none w-full">
      {beginning + ending > 0 && (
        <button type="button" className="" onClick={zoomOut}>
          Reset year range
        </button>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          width={800}
          height={300}
          id={id}
          data={data}
          onMouseDown={(e) => {
            if (e) {
              setZoomGraph((prev) => ({ ...prev, refAreaLeft: e.activeLabel }));
            }
          }}
          onMouseMove={(e) =>
            zoomGraph.refAreaLeft &&
            setZoomGraph((prev) => ({ ...prev, refAreaRight: e.activeLabel }))
          }
          onMouseUp={zoom}
        >
          <XAxis
            dataKey="year"
            allowDataOverflow
            domain={left && right ? [left, right] : undefined}
            type="number"
          />
          <YAxis
            allowDataOverflow
            domain={[bottom, top]}
            yAxisId="1"
            type="number"
          />
          <YAxis
            orientation="right"
            allowDataOverflow
            domain={[bottom2, top2]}
            yAxisId="2"
            type="number"
          />
          <Tooltip />
          <Line
            yAxisId="1"
            type="monotone"
            dataKey="physicians"
            stroke="#8884d8"
            name="Actions"
          />
          <Line
            yAxisId="2"
            type="monotone"
            dataKey="actions"
            stroke="#82ca9d"
            animationDuration={300}
            name="Physicians"
          />

          {refAreaLeft && refAreaRight ? (
            <ReferenceArea
              yAxisId="2"
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
