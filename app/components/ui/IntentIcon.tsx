import type { Icon, IconWeight } from "@phosphor-icons/react";
import { forwardRef } from "react";

interface Properties {
  Icon: Icon;
  alt?: string;
  inactiveWeight?: IconWeight;
  activeWeight?: IconWeight;
  className?: string;
  align?: "middle";
}

/**
 * Icon that changes from duotone to fill version on hover and focus
 */
export const IntentIcon = forwardRef<any, Properties>(
  (
    { Icon, alt, inactiveWeight, activeWeight, className, align, ...rest },
    ref
  ) => {
    return (
      <span ref={ref} className={`${className}`} {...rest}>
        <Icon
          className={`inline text-lg group-hover:hidden group-focus-visible:hidden ${
            align === "middle" ? "align-middle" : "align-baseline"
          }`}
          alt={alt}
          weight={inactiveWeight ?? "duotone"}
        />
        <Icon
          weight={activeWeight ?? "fill"}
          className={`hidden text-lg group-hover:inline group-focus-visible:inline ${
            align === "middle" ? "align-middle" : "align-baseline"
          }`}
          alt={alt}
        />
      </span>
    );
  }
);
IntentIcon.displayName = "IntentIcon";
