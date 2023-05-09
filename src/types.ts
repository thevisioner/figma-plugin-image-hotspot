export const MessageTypes = {
  CREATE_HOTSPOT: "Create hotspot",
  HOTSPOT_SELECTED: "Hotspot selected",
  HOTSPOT_UNSELECTED: "Hotspot unselected",
  NO_FRAME_SELECTED: "No frame selected",
  RESIZE_UI: "Resize UI",
  RENAME_HOTSPOT: "Rename hotspot",
} as const;

export const SelectionTypes = {
  NO_SELECTION: "No selection",
  NO_SELECTION_CONTAINING_HOTSPOTS: "No selection containing hotspots",
  NO_HOTSPOTS_SELECTED: "No hotspots selected",
  ONE_HOTSPOT_SELECTED: "One hotspot selected",
  MULTIPLE_HOTSPOTS_SELECTED: "Multiple hotspots selected",
} as const;

export type OutputFormat = "css" | "json";

export type OutputDataShape = {
  frames?: FrameProps[];
};

export type FrameProps = {
  __nodeId: string;
  id: string;
  name: string;
  width: number;
  height: number;
  hotspots: HotspotProps[];
};

export type HotspotProps = {
  __nodeId: string;
  id: string;
  name: string;
  left: number;
  top: number;
  x: number;
  y: number;
};

export type InputProps = {
  id: string;
  name: string;
};

// TODO: Create a HotspotNode type
