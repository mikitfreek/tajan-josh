const Format = {
  reset: "[0m",
  bright: "[1m",
  dim: "[2m",
  underscore: "[4m",
  blink: "[5m",
  reverse: "[7m",
  hidden: "[8m",
  fg: {
    black: "[30m",
    red: "[31m",
    green: "[32m",
    yellow: "[33m",
    blue: "[34m",
    magenta: "[35m",
    cyan: "[36m",
    white: "[37m",
    crimson: "[38m"
  },
  bg: {
    black: "[40m",
    red: "[41m",
    green: "[42m",
    yellow: "[43m",
    blue: "[44m",
    magenta: "[45m",
    cyan: "[46m",
    white: "[47m",
    crimson: "[48m"
  }
};
const Style = {
  basic: Format.dim,
  error: Format.fg.red,
  warning: Format.fg.yellow,
  success: Format.fg.green,
  info: Format.fg.blue
};
class Logs {
  constructor() {
  }
  log(text, type = null) {
    let style = Style.basic;
    if (type !== null) {
      if (type === "error")
        style = Style.error;
      else if (type === "warning")
        style = Style.warning;
      else if (type === "success")
        style = Style.success;
      else if (type === "info")
        style = Style.info;
    }
    console.log(`${style}%s${Format.reset}`, text);
  }
  print(msg) {
    const elapsed = Date.now();
    const now = new Date(elapsed);
    const time = now.toUTCString();
    console.log(`
${time}`);
    console.log(msg);
    console.log(` `);
  }
}
module.exports = {Logs};
