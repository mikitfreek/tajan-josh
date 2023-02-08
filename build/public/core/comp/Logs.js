const Style = {
  base: [
    "color: #fff",
    "background-color: #282828",
    "padding: 2px 4px",
    "border-radius: 2px"
  ],
  error: [
    "color: #eee",
    "background-color: #ff0000"
  ],
  warning: [
    "background-color: #ffcc00"
  ],
  success: [
    "background-color: #1db954"
  ],
  info: [
    "background-color: #1663be"
  ]
};
export class Logs {
  constructor() {
  }
  log(text, type = null) {
    let style = Style.base.join(";") + ";";
    let extra = [];
    if (type !== null) {
      if (type === "error")
        extra = Style.error;
      else if (type === "warning")
        extra = Style.warning;
      else if (type === "success")
        extra = Style.success;
      else if (type === "info")
        extra = Style.info;
      style += extra.join(";");
    }
    console.log(`${type !== null ? `%c${type}` : ""}%c ${text}`, style, Style.base);
  }
  print(msg) {
    const elapsed = Date.now();
    const now = new Date(elapsed);
    const time = now.toUTCString();
    console.log(`
${time}`);
    console.log(msg);
  }
}
