import type { Dispatch, ReactNode, SetStateAction } from "react";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import Fuse from "fuse.js";

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
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    if (!searchValue) {
      // Don't do with items without copying since it's in place
      return Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a])
        .map((key) => ({ item: key }));
    }
    const fuse = new Fuse(Object.keys(counts), {
      includeScore: false,
    });
    return fuse.search(searchValue);
  }, [counts, searchValue]);

  return (
    <div className="flex flex-col gap-1">
      <Ariakit.ComboboxProvider
        // TODO Reset value on select
        resetValueOnHide
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
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
            <Ariakit.SelectPopover
              gutter={4}
              sameWidth
              className="popover pt-0"
            >
              <div className="sticky top-0 mb-2 w-full bg-inherit pt-2">
                <Ariakit.Combobox
                  autoSelect
                  placeholder="Search..."
                  className="w-full h-10 rounded border-none px-4 leading-4"
                />
              </div>
              <Ariakit.ComboboxList>
                {matches.map(({ item: key }) => (
                  <Ariakit.SelectItem
                    key={`action-${key}`}
                    // @ts-ignore TODO File ticket with ariakit to allow number
                    value={items.indexOf(key)}
                    className="scroll-m-2 scroll-mt-14 p-1 flex items-center gap-2 cursor-pointer data-[active-item]:bg-accent rounded-sm aria-selected:bg-accent/50"
                    render={<Ariakit.ComboboxItem />}
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
              </Ariakit.ComboboxList>
            </Ariakit.SelectPopover>
          )}
        </Ariakit.SelectProvider>
      </Ariakit.ComboboxProvider>
    </div>
  );
};
