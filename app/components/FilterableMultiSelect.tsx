import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

interface Props {
  label: ReactNode;
  values: number[];
  setValues: Dispatch<SetStateAction<number[]>>;
  items: string[];
  counts: {
    [key: string]: number;
  };
  nullFallback?: string;
}

/**
 * Multiselect component that allows filtering contents
 * https://ariakit.org/examples/select-combobox
 */
export const FilterableMultiSelect = ({
  label,
  values,
  setValues,
  items,
  counts,
  nullFallback = "N/A",
}: Props) => {
  const [mounted, setMounted] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      {/* @ts-ignore ariakit TS issue */}
      <Ariakit.SelectProvider
        // Don't think needed
        // defaultValue={values}
        value={values}
        setValue={setValues}
        setMounted={setMounted}
        focusLoop
      >
        <div className="flex items-end justify-between">
          <Ariakit.SelectLabel className="select-label">
            {label}
          </Ariakit.SelectLabel>
          {values.length > 0 && (
            <button
              type="button"
              className="text-xs hover:underline"
              onClick={() => {
                setValues([]);
              }}
            >
              Clear
            </button>
          )}
        </div>
        <Ariakit.Select className="flex justify-between items-center py-2.5 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            {values.map((v) => (
              <div
                key={v}
                className="flex items-center gap-1 bg-blue-100 whitespace-nowrap text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
              >
                <div>{items[v] ?? nullFallback}</div>
                <div className="bg-white rounded-full px-1">
                  {counts[items[v] ?? "null"]}
                </div>
              </div>
            ))}
          </div>
          <Ariakit.SelectArrow />
        </Ariakit.Select>
        {mounted && (
          <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
            {/* Don't do with items without copying since it's in place */}
            {Object.keys(counts)
              .sort((a, b) => counts[b] - counts[a])
              .map((key: string) => (
                <Ariakit.SelectItem
                  key={`action-${key}`}
                  // @ts-ignore TODO File ticket with ariakit to allow number
                  value={items.indexOf(key)}
                  className="select-item"
                >
                  <Ariakit.SelectItemCheck />
                  <div className="[&>*]:align-middle">
                    <span>{key === "null" ? nullFallback : key} </span>
                    <span className="bg-white rounded-full px-1 text-black text-xs">
                      {counts[key]}
                    </span>
                  </div>
                </Ariakit.SelectItem>
              ))}
          </Ariakit.SelectPopover>
        )}
      </Ariakit.SelectProvider>
    </div>
  );
};
