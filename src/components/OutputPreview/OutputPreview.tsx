import * as React from "react";
import { rem } from "polished";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import { OutputFormat, OutputDataShape } from "../../types";
import * as styles from "./OutputPreview.css";
import Icon from "../Icon";

hljs.registerLanguage("json", json);
hljs.registerLanguage("css", css);
hljs.configure({
  ignoreUnescapedHTML: true,
});

export default function OutputPreview({
  format = "json",
  data = {},
  onCopy = () => {},
}: {
  format: OutputFormat;
  data: OutputDataShape;
  onCopy?: () => void;
}) {
  const output = hljs.highlight(encodeOutput({ format, data }), {
    language: format,
  }).value;
  // FIXME: Make sure output is safe
  // https://github.com/highlightjs/highlight.js/wiki/security
  // const safeOutput = output
  //   .replace(/</g, "&lt;")
  //   .replace(/>/g, "&gt;")
  //   .replace(/&/g, "&amp;");

  const elRef = React.useRef<HTMLPreElement>(null);
  React.useEffect(() => {
    const codeEl = elRef.current;
    if (codeEl) {
      hljs.highlightElement(codeEl);
    }
  }, [output]);

  const [copied, setCopied] = React.useState(false);
  function internalOnCopy() {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
    onCopy();
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap"
        rel="stylesheet"
      />

      {(data.frames ?? []).length > 0 ? (
        <div className={styles.wrapper}>
          <pre className={styles.pre}>
            <span className={styles.outputFormat}>{format.toUpperCase()}</span>
            <code
              ref={elRef}
              className={`language-${format}`}
              dangerouslySetInnerHTML={{ __html: output }}
            />

            <button
              type="button"
              title={`Copy ${format.toUpperCase()} output to clipboard`}
              className={styles.copyButton}
              onClick={internalOnCopy}
            >
              {copied ? <Icon render="done" /> : <Icon render="copy" />}
            </button>
          </pre>
        </div>
      ) : null}
    </>
  );
}

const encodeOutput = ({
  format,
  data,
}: {
  format: OutputFormat;
  data: OutputDataShape;
}) => {
  switch (format) {
    case "json":
      return outputJson(data);
    case "css":
      return outputCss(data);
  }
};

export const outputJson = (data: OutputDataShape) => {
  const frames =
    data.frames?.map((frame) => {
      return {
        ...frame,
        hotspots:
          frame.hotspots?.map((hotspot) => {
            return {
              ...hotspot,
              left: toFixed(hotspot.left, 5),
              top: toFixed(hotspot.top, 5),
            };
          }) ?? [],
      };
    }) ?? [];
  const output = {
    frames,
  };
  return JSON.stringify(output, null, 2);
};

export const outputCss = (data: OutputDataShape) => {
  const output = (
    data.frames?.map((frame) => {
      return `.frame[data-id="${frame.id}"] {
  width: ${rem(frame.width)}; /* ${frame.width}px */
  height: ${rem(frame.height)}; /* ${frame.height}px */
}
${(
  frame.hotspots?.map((hotspot) => {
    return `.frame[data-id="${frame.id}"] 
.hotspot[data-id="${hotspot.id}"] {
  left: ${toFixed(hotspot.left * 100, 3)}%;
  top: ${toFixed(hotspot.top * 100, 3)}%;
}`;
  }) ?? []
).join("\n")}
`;
    }) ?? []
  ).join("\n");
  return output;
};

const toFixed = (num: number, precision: number) =>
  parseFloat(Number(num).toFixed(precision));
