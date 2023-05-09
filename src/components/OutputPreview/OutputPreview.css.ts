import { style, globalStyle } from "@vanilla-extract/css";
import { lighten } from "polished";
import { vars, tokens } from "../../styles.css";

export const wrapper = style({
  backgroundColor: vars.color.background,
  borderRadius: "0.25rem",
  height: "25.5rem",
  marginTop: "0.5rem",
  padding: "0.5rem",
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

export const pre = style({
  color: vars.color.subduedText,
  fontFamily: `'Roboto Mono', monospace`,
  fontSize: "0.8rem",
  lineHeight: 2,
  margin: 0,
  minHeight: "100%",
  position: "relative",
});

export const outputFormat = style({
  color: vars.color.subduedText,
  display: "block",
  fontWeight: 500,
  lineHeight: 1,
  marginBottom: "0.2rem",
});

export const copyButton = style({
  backgroundColor: lighten(0.025, tokens.color.background),
  borderColor: lighten(0.05, tokens.color.background),
  margin: 0,
  padding: "0.5rem 0.6rem",
  ":hover": {
    backgroundColor: lighten(0.075, tokens.color.background),
    borderColor: lighten(0.1, tokens.color.background),
  },
  position: "absolute",
  right: 0,
  bottom: 0,
});

globalStyle(`${pre} ::selection`, {
  backgroundColor: vars.color.selection,
});

// json
globalStyle(`.hljs.language-json .hljs-string`, {
  color: vars.color.mint,
});

globalStyle(`.hljs.language-json .hljs-number`, {
  color: vars.color.text,
});

globalStyle(`.hljs.language-json .hljs-attr`, {
  color: vars.color.blue,
});

// css
globalStyle(`.hljs.language-css .hljs-selector-class`, {
  color: vars.color.blue,
});

globalStyle(`.hljs.language-css .hljs-selector-attr`, {
  color: vars.color.blue,
});

globalStyle(`.hljs.language-css .hljs-attribute`, {
  color: vars.color.text,
});

globalStyle(`.hljs.language-css .hljs-number`, {
  color: vars.color.mint,
});
