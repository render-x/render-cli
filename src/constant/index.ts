import os = require('os');

export const USER_HOME_PATH = os.homedir();
export const CLI_NAME = 'render-cli';

export const APP_LIST: Array<{ name: string; value: string }> = [
  {
    name: 'react组件库模板（component）',
    value: '@x.render/react-component-template',
  },
  {
    name: '模块库模版（module）',
    value: '@render-ae86/ae86-module-template',
  },
  {
    name: 'react中后台项目模板（web）',
    value: '@render-ae86/ae86-admin-template',
  },
  {
    name: 'react移动端H5应用模板 (h5)',
    value: 'moga-h5',
  },
  {
    name: 'react多页面应用模板（mpa）',
    value: 'moga-mpa',
  },
];

export const BUILDER_CONFIG_FILE_TYPE = [
  'build.json',
  'build.config.(js|ts|mjs|mts|cjs|cts)',
];
