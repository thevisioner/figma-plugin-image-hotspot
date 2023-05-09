import * as React from "react";
import { createRoot } from "react-dom/client";
import slugify from "slugify";
import {
  MessageTypes,
  OutputDataShape,
  OutputFormat,
  SelectionTypes,
} from "./types";
import { Icon, OutputPreview } from "./components";
import { outputCss, outputJson } from "./components/OutputPreview";

// Helps with debugging UI in browser
if (process.env.NODE_ENV === "development") {
  require("./figma-style.css");
}
import "./ui.css";
import clsx from "clsx";
import * as styles from "./styles.css";

type StateProps = {
  hotspotName: string;
  isDisabled: boolean;
  outputFormat: OutputFormat;
  outputData: OutputDataShape;
  oneHotspotSelected: boolean;
};

export const availableOutputFormats = ["css", "json"] as const;

function App() {
  const [state, setState] = React.useState<StateProps>({
    hotspotName: "",
    isDisabled: true,
    outputFormat: "json",
    outputData: {},
    oneHotspotSelected: false,
  });

  const id = slugify(state.hotspotName, { lower: true });

  React.useEffect(() => {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      switch (message.type) {
        case SelectionTypes.NO_SELECTION:
        case SelectionTypes.NO_SELECTION_CONTAINING_HOTSPOTS: {
          setState({
            ...state,
            hotspotName: "",
            isDisabled: true,
            outputData: {},
            oneHotspotSelected: false,
          });
          break;
        }

        case SelectionTypes.NO_HOTSPOTS_SELECTED: {
          setState({
            ...state,
            hotspotName: "",
            isDisabled: false,
            outputData: message.data,
            oneHotspotSelected: false,
          });
          break;
        }

        case SelectionTypes.ONE_HOTSPOT_SELECTED: {
          setState({
            ...state,
            hotspotName: message.hotspot.name,
            isDisabled: false,
            outputData: message.data,
            oneHotspotSelected: true,
          });
          break;
        }

        case SelectionTypes.MULTIPLE_HOTSPOTS_SELECTED: {
          setState({
            ...state,
            hotspotName: "",
            isDisabled: false,
            outputData: message.data,
            oneHotspotSelected: false,
          });
          break;
        }

        case MessageTypes.RESIZE_UI: {
          // Do nothing. This is handled by the code.ts
          break;
        }

        default:
          console.log("Unknown message type", message.type);
      }
    };
  }, [state]);

  const updateHotspotName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      hotspotName: e.target.value,
    });
  };

  const updateOutputFormat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState({
      ...state,
      outputFormat: e.target.value as OutputFormat,
    });
  };

  const onCreateHotspot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state.hotspotName) return;

    if (state.oneHotspotSelected) {
      parent.postMessage(
        {
          pluginMessage: {
            type: MessageTypes.RENAME_HOTSPOT,
            data: {
              id,
              name: state.hotspotName,
            },
          },
        },
        "*"
      );
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: MessageTypes.CREATE_HOTSPOT,
          data: {
            id,
            name: state.hotspotName,
          },
        },
      },
      "*"
    );

    setState({
      ...state,
      hotspotName: "",
    });
  };

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const containsOuputData = Object.keys(state.outputData).length > 0;

  const onDetailsToggle = () => {
    setDetailsOpen(!detailsOpen);
  };

  React.useEffect(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: MessageTypes.RESIZE_UI,
          data: {
            height: containsOuputData && detailsOpen ? 696 : 272,
          },
        },
      },
      "*"
    );
  }, [containsOuputData, detailsOpen]);

  const [exported, setExported] = React.useState(false);
  React.useEffect(() => {
    if (exported) {
      const timeout = setTimeout(() => {
        setExported(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [exported]);

  const onExportData = () => {
    useDeprecatedWriteToClipboard(state.outputFormat, state.outputData);
    setExported(true);
  };

  const onCopyOutput = () => {
    useDeprecatedWriteToClipboard(state.outputFormat, state.outputData);
  };

  function useDeprecatedWriteToClipboard(
    format: OutputFormat,
    output: OutputDataShape
  ) {
    const textArea = document.createElement("textarea");
    textArea.style.width = "0";
    textArea.style.height = "0";
    textArea.style.opacity = "0";
    textArea.readOnly = true;
    textArea.textContent =
      format === "json" ? outputJson(output) : outputCss(output);
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
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
        href="https://fonts.googleapis.com/css2?family=DM+Sans&display=swap"
        rel="stylesheet"
      />

      <div
        className={clsx(styles.container, {
          [styles.disabledContainer]: state.isDisabled,
        })}
        // TODO: Create notification if user clicks
        // multiple times on disabled container
      >
        <form className={styles.form} onSubmit={onCreateHotspot}>
          <div className={styles.nameGroup}>
            <label htmlFor="name-input" className={styles.label}>
              Name
            </label>
            <div className={styles.nameGroupRow}>
              <input
                type="text"
                id="name-input"
                className={styles.nameInput}
                value={state.hotspotName}
                minLength={3}
                onChange={updateHotspotName}
                placeholder="Unique hotspot name"
              />
              <button
                type="submit"
                className={styles.nameSubmit}
                disabled={state.hotspotName?.length < 3}
                title={
                  state.oneHotspotSelected ? "Rename hotspot" : "Add hotspot"
                }
              >
                <span>
                  {state.oneHotspotSelected ? (
                    <Icon render="rename" />
                  ) : (
                    <Icon render="add" />
                  )}
                </span>
              </button>
            </div>
          </div>
          <div className={styles.idGroup}>
            <label htmlFor="id-output" className={styles.label}>
              ID:
            </label>
            <output
              id="id-output"
              className={clsx(styles.idOutput, !!id && styles.idOutputHasValue)}
              htmlFor="name-input"
            >
              {id || "–"}
            </output>
          </div>
        </form>

        {/* TODO: Message, for errors and output stats. Resize panel ui before
            and after message: figma.ui.resize(width, height) */}

        <div className="stack">
          <select
            className={styles.outputFormatSelect}
            value={state.outputFormat}
            onChange={updateOutputFormat}
          >
            {availableOutputFormats.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.exportButton}
            onClick={onExportData}
          >
            {/* TODO: Get selected frame name or label: 'Export {n} frames' */}
            {exported ? "Data saved in clipboard" : "Export data"}
          </button>

          {/* TODO: Design as a separate panel element */}
          <details
            className={clsx(
              styles.details,
              !containsOuputData && styles.detailsDisabled
            )}
            open={detailsOpen}
            onClick={(e) => e?.preventDefault()}
          >
            <summary className={styles.summary} onClick={onDetailsToggle}>
              <span>Preview</span>
              <Icon
                className={styles.summaryIcon}
                render="expand"
                style={{
                  transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </summary>
            <OutputPreview
              format={state.outputFormat}
              data={state.outputData}
              onCopy={onCopyOutput}
            />
          </details>
        </div>

        {/* TODO: Add 'Help' button at right bottom corner ?? */}
      </div>
    </>
  );
}

const app = document.getElementById("app");
const root = createRoot(app!);
root.render(<App />);
