import fse = require('fs-extra');
import path = require('path');
import { RenderCommand, CommandType, Json } from '@x.render/render-command';
import { USER_HOME_PATH } from '@x.render/render-node-utils/lib/constant';
import { CLI_HOME, UPLOAD_CONFIG_FILT } from '../constant';
import recursive = require('recursive-readdir');
import chalk = require('chalk');
import ora = require('ora');

const OSS = require('ali-oss');
const inquirer = require('inquirer');

const prompt = inquirer.prompt;

const cwd = process.cwd();
const pkg = require(path.resolve(cwd, 'package.json'));
const abc = require(path.resolve(cwd, 'abc.json'));

const configFilePath = path.resolve(
  USER_HOME_PATH,
  CLI_HOME,
  UPLOAD_CONFIG_FILT,
);

class UploadCommand extends RenderCommand {
  options: Json;
  client: any;
  uploadConfig: Record<string, any>;

  constructor(rest: string, options: Json, cmd: CommandType) {
    super(rest, options, cmd);
    this.init();
  }

  async init() {
    const hasConfigFile = fse.existsSync(path.resolve(configFilePath));
    let shouldInputConfig = !hasConfigFile;
    shouldInputConfig = this.options.reset ? true : shouldInputConfig;

    if (shouldInputConfig) {
      await this.saveUploadConfig();
    }

    this.exec();
  }

  async saveUploadConfig() {
    this.uploadConfig = await this.getUploadConfig();
    fse.ensureFileSync(configFilePath);
    fse.writeFileSync(
      configFilePath,
      JSON.stringify(this.uploadConfig, null, 2),
      {
        encoding: 'utf-8',
      },
    );
  }

  async getRegion() {
    const { region }: { region: string } = await prompt({
      type: 'input',
      name: 'region',
      message: 'Please enter your region:',
    });
    return region;
  }
  async getAccessKeyId() {
    const { accessKeyId }: { accessKeyId: string } = await prompt({
      type: 'input',
      name: 'accessKeyId',
      message: 'Please enter your accessKeyId:',
    });
    return accessKeyId;
  }
  async getAccessKeySecret() {
    const { accessKeySecret }: { accessKeySecret: string } = await prompt({
      type: 'input',
      name: 'accessKeySecret',
      message: 'Please enter your accessKeySecret:',
    });
    return accessKeySecret;
  }
  async getBucket() {
    const { bucket }: { bucket: string } = await prompt({
      type: 'input',
      name: 'bucket',
      message: 'Please enter your bucket:',
    });
    return bucket;
  }

  async getUploadConfig() {
    return {
      region: await this.getRegion(),
      accessKeyId: await this.getAccessKeyId(),
      accessKeySecret: await this.getAccessKeySecret(),
      bucket: await this.getBucket(),
    };
  }

  async createOssInstance() {
    this.uploadConfig = this.uploadConfig || require(configFilePath);
    return await new OSS({
      region: this.uploadConfig.region,
      accessKeyId: this.uploadConfig.accessKeyId,
      accessKeySecret: this.uploadConfig.accessKeySecret,
      bucket: this.uploadConfig.bucket,
    });
  }

  async getFileList(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      recursive(
        path.resolve(cwd, abc?.uploadConfig?.sourceDir || 'dist'),
        (err, fileNames) => {
          if (err) {
            reject(err);
          }
          resolve(fileNames);
        },
      );
    });
  }

  async getFileInfo() {
    const fileList = await this.getFileList();
    const fileNames = fileList.map((file) => {
      return path.relative(cwd, file);
    });
    return fileNames;
  }

  getUrl(url: string) {
    const urlObject = new URL(url);
    const origin = abc.uploadConfig.domain || urlObject.origin;
    return origin + urlObject.pathname;
  }

  async putFile(filepath: string) {
    const spinner = ora('uploading: ' + filepath).start();
    const result = await this.client.put(
      path.join(abc?.uploadConfig?.targetDir || pkg.name, filepath),
      path.normalize(filepath),
    );

    spinner.succeed(
      `The resource address is: ${chalk.blue(this.getUrl(result.url))}`,
    );
  }

  async uploadFile(fileList: string[]) {
    this.client = await this.createOssInstance();
    fileList.forEach((filepath) => {
      this.putFile(filepath);
    });
  }

  async exec() {
    const fileNames = await this.getFileInfo();
    await this.uploadFile(fileNames);
  }
}

export = (rest: string, options: Json, cmd: CommandType) => {
  return new UploadCommand(rest, options, cmd);
};
