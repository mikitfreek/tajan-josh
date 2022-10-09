module.exports = {
  // mount: {
  //   //   '': '/',
  //   server: '/server',
  //   web: '/web',
  // },
  optimize: {
    sourcemap: 'external',
    bundle: true,
    minify: true,
    target: 'es2018',
  },
  mount: {
    server: { url: '/server' },
    web: { url: '/web' },
  },
  packageOptions: {
      source: 'local'
  },
  exclude: [
    '**/node_modules/**/*',
    '**/.vscode/**/*'
  ],
};