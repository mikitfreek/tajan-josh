const Format = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  // Foreground (text) colors
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m"
  },
  // Background colors
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
};

const Style = {
  basic: Format.dim,
  error: Format.fg.red,
  warning: Format.fg.yellow,
  success: Format.fg.green,
  info: Format.fg.blue,
}

class Logs {

  constructor() { }

  log(text, type = null) {
    let style = Style.basic
    if (type !== null) {
      if (type === 'error') style = Style.error
      else if (type === 'warning') style = Style.warning
      else if (type === 'success') style = Style.success
      else if (type === 'info') style = Style.info
    }
    console.log(`${style}%s${Format.reset}`, text);
  }

  print(msg) {
    const elapsed = Date.now();
    const now = new Date(elapsed);
    const time = now.toUTCString();

    console.log(`\n${time}`)
    console.log(msg)
    console.log(` `)
  }
}

module.exports = { Logs }
