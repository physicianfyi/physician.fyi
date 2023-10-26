/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  tailwind: true,
  serverDependenciesToBundle: [
    "@phosphor-icons/react",
    "posthog-js/react",
    "react-map-gl",
    "@visx/vendor/d3-array",
    "@visx/responsive",
    "lodash/debounce",
  ],
};
