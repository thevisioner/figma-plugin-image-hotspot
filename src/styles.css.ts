import { createGlobalTheme, globalStyle, style } from "@vanilla-extract/css";

// TODO: Add light theme

export const tokens = {
  color: {
    blue: "#7dd3fc",
    mint: "#6ee7b7",
    pink: "#e879f9",
    text: "#e4e4e7",
    subduedText: "#a1a1aa",
    background: "#18181b",
    selection: "#27272a",
    surface: "#303032",
  },
};

export const vars = createGlobalTheme(":root", tokens);

globalStyle("body", {
  fontFamily: `'DM Sans', sans-serif`,
  color: "#e4e4e7",
  outlineOffset: "2px",
  outlineColor: vars.color.blue,
  userSelect: "none",
});

globalStyle("#app", {
  height: "100%",
  overflowY: "hidden",
});

export const container = style({
  padding: "0.5rem",

  height: "100%",
  overflowX: "hidden",
  overflowY: "auto",
  scrollbarWidth: "thin",
  "::-webkit-scrollbar": {
    backgroundColor: vars.color.surface,
    width: "5px",
  },
  "::-webkit-scrollbar-thumb": {
    backgroundColor: vars.color.subduedText,
  },
});

export const disabledContainer = style({
  opacity: 0.5,
  pointerEvents: "none",
});

const layoutBase = style({
  display: "grid",
  gridGap: "0.5rem",
});

export const form = style([
  layoutBase,
  {
    gridTemplateRows: "auto auto",
  },
]);

export const label = style({
  color: vars.color.subduedText,
});

export const nameGroup = style([layoutBase]);

export const nameGroupRow = style([
  layoutBase,
  {
    gridRow: 2,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gridGap: 0,
    backgroundColor: vars.color.surface,
    border: `2px solid ${tokens.color.subduedText}`,
    borderRadius: "0.25rem",
    ":focus-within": {
      borderColor: vars.color.blue,
    },
  },
]);

export const nameInput = style({
  border: "none",
  userSelect: "text",
  ":focus": {
    outline: "none",
  },
  "::selection": {
    backgroundColor: vars.color.blue,
  },
});

export const nameSubmit = style({
  backgroundColor: "transparent",
  border: "none",
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  ":focus": {
    outline: "none",
  },
});

export const idGroup = style([
  layoutBase,
  {
    gridTemplateColumns: "auto 1fr",
  },
]);

export const idOutput = style({
  color: vars.color.subduedText,
});

export const idOutputHasValue = style({
  justifySelf: "start",
  border: `2px solid transparent`,
  color: vars.color.blue,
  margin: "calc((0.1em + 2px) * -1) -0.2em",
  padding: "0.1em 0.2em",
  userSelect: "all",
  ":hover": {
    border: `2px dotted ${vars.color.subduedText}`,
    outline: "none",
  },
  "::selection": {
    backgroundColor: vars.color.surface,
  },
});

const selectReset = style({
  appearance: "none",
  backgroundColor: "transparent",
  border: "none",
  cursor: "inherit",
  font: "inherit",
  lineHeight: "inherit",
  margin: 0,
  padding: 0,
  width: "100%",

  selectors: {
    "&::-ms-expand": {
      display: "none",
    },
  },
});

export const outputFormatSelect = style([
  selectReset,
  {
    backgroundColor: vars.color.surface,
    // border: `2px solid ${tokens.color.subduedText}`,
    borderRadius: "0.25rem",
    color: vars.color.subduedText,
    marginLeft: "auto",
    padding: "0.25rem 0.5rem",
    width: "auto",

    border: `2px solid transparent`,
    display: "grid",
    textAlign: "right",

    ":focus": {
      outline: "none",
      border: `2px solid ${vars.color.blue}`,
    },
  },
]);

export const exportButton = style({
  marginTop: "0.5rem",
  marginBottom: "1rem",
});

export const details = style({
  color: vars.color.subduedText,
  ":hover": {
    color: vars.color.text,
  },
});

export const detailsDisabled = style({
  opacity: 0.5,
  cursor: "not-allowed",
  pointerEvents: "none",
});

export const summary = style({
  display: "inline-flex",
  alignItems: "center",
  listStyle: "none",
});

export const summaryIcon = style({
  marginLeft: "0.2rem",
});
