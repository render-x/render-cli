import os = require("os");

export const USER_HOME_PATH = os.homedir();
export const CLI_NAME = "render-cli";

export const APP_LIST: Array<{ name: string; value: string }> = [
  {
    name: "React Component",
    value: "@x.render/react-component-template",
  },
  {
    name: "React application",
    value: "@x.render/react-app-template",
  },
  {
    name: "React backend application",
    value: "@x.render/react-admin-template",
  },
];

export const BUILDER_CONFIG_FILE_TYPE = [
  "build.json",
  "build.config.(js|ts|mjs|mts|cjs|cts)",
];
