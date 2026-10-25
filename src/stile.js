// Global stylesheet of the site: theme colours (day / night / auto), links and buttons.
// Appended at the end of <head> of every page (reserved area, sign-in/registration, invitation),
// so it overrides the rules of the single pages. To change the look of the whole site edit only this file.
const GIORNO = "--bg:#f6f7f9;--card:#fff;--tx:#14181f;--mut:#5b6573;--line:#d9dee5;--acc:#0b6bcb;--btx:#fff;--esci:#c62828;--err:#b00020;--ok:#1a7f37";
const NOTTE = "--bg:#12151a;--card:#1b2027;--tx:#e8ecf1;--mut:#9aa6b4;--line:#2f3742;--acc:#5aa6ff;--btx:#0b1220;--esci:#e5534b;--err:#ff7a8a;--ok:#4cc26a";

export const STILE = [
  // themes: "Auto" follows the system, "Day" and "Night" force the choice (data-t attribute on <html>)
  ":root{" + GIORNO + ";color-scheme:light dark}",
  "@media (prefers-color-scheme:dark){:root:not([data-t=light]){" + NOTTE + "}}",
  ":root[data-t=light]{" + GIORNO + ";color-scheme:light}",
  ":root[data-t=dark]{" + NOTTE + ";color-scheme:dark}",
  "body{background:var(--bg);color:var(--tx)}",
  "a{color:var(--acc)}",
  // buttons: all blue with the same style
  "button{cursor:pointer;background:var(--acc);border:1px solid var(--acc);color:var(--btx);border-radius:6px}",
  "button:not(:disabled):hover{filter:brightness(1.08)}",
  "button:disabled{opacity:.5;cursor:default}",
  // exceptions: header links (language, theme, change password) and menu tabs
  "button.l{background:none;border-color:transparent;color:var(--acc)}",
  "nav button{background:none;color:var(--tx)}",
  ".tabs button{background:var(--bg);color:var(--tx);border-color:var(--line)}",
  ".tabs button.on{background:var(--acc);border-color:var(--acc);color:var(--btx)}",
  // Log out button: red
  "#bEsci{background:var(--esci);border-color:var(--esci);color:#fff}",
].join("\n");
