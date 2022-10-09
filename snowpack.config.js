// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  // root: '/src',
  mode: "development",
  mount: {
    'src/client/public': { url: '/public' },
    'src/server': { url: '/server' },
    // 'src/': { url: '/' },
    // 'src/server': { url: '/server' },
    // 'src/web': { url: '/public' },
    
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    source: 'local'
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    // watch: true
  },
  optimize: {
    sourcemap: 'external',
    splitting: true,
    bundle: true,
    minify: true,
    target: 'es2018',
  },
};
