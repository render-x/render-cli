# @x.render/render-cli

<p>
<a href="https://www.npmjs.com/package/@x.render/render-cli" target="__blank"><img src="https://img.shields.io/npm/v/@x.render/render-cli" alt="NPM version"></a>

<a href="https://www.npmjs.com/package/@x.render/render-cli" target="__blank"><img src="https://img.shields.io/npm/dw/@x.render/render-cli
" alt="NPM Downloads"></a>

</p>

<br/>

[English document](./README.md)

## 介绍

基础脚手架，支持下载应用模板，内部集成 `render-builder` 进行应用开发和构建，并提供云发布和云构建功能。

## 使用

```bash
npm install @x.render/render-cli -g
```

render-cli 安装完成后，会在系统全局提供一个可执行命令：`render`

## Commands

render-cli 目前提供了三个命令供开发者使用。

### init

init 命令用于下载各种应用程序模板。

```bash
render init
```

使用 force 选项强制将应用程序模板下载到当前目录并删除其他文件。

```bash
render init --force
```

### start and build

render-cli 使用多进程调用 render-builder 来实现 start 和 build 命令。

[这里可以看到 render-builde 中 start 和 build 命令的介绍](https://www.npmjs.com/package/@x.render/render-builder#commands)

### upload

upload 命令用于上传构建产物到阿里云 OSS。

```bash
render upload
```

第一次使用时，会填写一些配置信息，用于文件上传，使用 reset 选项可以重置之前的配置信息：

```bash
render upload --reset
```

or

```bash
render upload -r
```
