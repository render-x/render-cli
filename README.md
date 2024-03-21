# @x.render/render-cli

<p>
<a href="https://www.npmjs.com/package/@x.render/render-cli" target="__blank"><img src="https://img.shields.io/npm/v/@x.render/render-cli" alt="NPM version"></a>

<a href="https://www.npmjs.com/package/@x.render/render-cli" target="__blank"><img src="https://img.shields.io/npm/dw/@x.render/render-cli
" alt="NPM Downloads"></a>

</p>

<br/>

[中文文档](./README.zh.md)

## Introduce

A basic scaffold that supports downloading application templates, integrates the render-builder internally for application development and construction, and provides cloud publishing and cloud building features.

## Usage

```bash
npm install @x.render/render-cli -g
```

After the render-cli is installed, an executable command will be provided globally in the system: `render`

## Commands

render-cli currently provides three commands for developers to use.

### init

The init command is used to download various application templates.

```bash
render init
```

Use the force option to force the application template to be downloaded in the current directory and delete other files.

```bash
render init --force
```

### start and build

Render-cli uses multiple processes to call render-builder to implement the start and build commands.

[Here you can see an introduction to the start and build commands in render-builder](https://www.npmjs.com/package/@x.render/render-builder#commands)

### upload

The upload command can upload files to Alibaba Cloud OSS.

```bash
render upload
```

When using it for the first time, some configuration information will be filled in, which is used for file upload. Use the reset option to reset previous configuration information:

```bash
render upload --reset
```

or

```bash
render upload -r
```

The default upload directory and the Bucket directory after upload are: dist and the name in the current project package.json. You can use abc.josn in the project to change this default behavior. The following is a configuration example:

```json
{
  "uploadConfig": {
    "sourceDir": "build",
    "targetDir": "pages",
    "domain": "https://example.com"
  }
}
```

Among them, domain will replace the domain name in the returned file OSS access address to facilitate file preview.
