import * as React from "react";

type IconProps = {
  render: "add" | "rename" | "copy" | "expand" | "done";
  className?: string;
  style?: React.CSSProperties;
};

export default function Icon({ render, className, style }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 96 960 960"
    >
      {render === "add" && (
        <path
          fill="currentColor"
          d="M450 856V606H200v-60h250V296h60v250h250v60H510v250h-60Z"
        />
      )}

      {render === "rename" && (
        <path
          fill="currentColor"
          d="m394 936 140-140h346v140H394Zm-254-60h44l443-443-44-44-443 443v44Zm614-486L626 262l42-42q17-17 42.5-16.5T753 221l43 43q17 17 17 42t-17 42l-42 42Zm-42 42L208 936H80V808l504-504 128 128Zm-107-21-22-22 44 44-22-22Z"
        />
      )}

      {render === "copy" && (
        <path
          fill="currentColor"
          d="M180 975q-24 0-42-18t-18-42V312h60v603h474v60H180Zm120-120q-24 0-42-18t-18-42V235q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440V235H300v560Zm0 0V235v560Z"
        />
      )}

      {render === "expand" && (
        <path
          fill="currentColor"
          d="M480 711 240 471l43-43 197 198 197-197 43 43-240 239Z"
        />
      )}

      {render === "done" && (
        <path
          fill="currentColor"
          d="M378 810 154 586l43-43 181 181 384-384 43 43-427 427Z"
        />
      )}
    </svg>
  );
}
