import fse = require('fs-extra');
import path = require('path');
import { RenderCommand, CommandType, Json } from '@x.render/render-command';
import { USER_HOME_PATH } from '@x.render/render-node-utils/lib/constant';
import { CLI_HOME, UPLOAD_CONFIG_FILT } from '../constant';
import recursive = require('recursive-readdir');
import chalk = require('chalk');
import ora = require('ora');
import { ABC } from '../types';

const OSS = require('ali-oss');
const inquirer = require('inquirer');

const prompt = inquirer.prompt;

class UploadCommand extends RenderCommand {
  options: Json;
  client: any;
  uploadConfig: Record<string, any>;
  configFilePath: string;
  cwd: string;
  pkg: Record<string, any>;
  abc: ABC;

  constructor(rest: string, options: Json, cmd: CommandType) {
    super(rest, options, cmd);
    this.configFilePath = path.resolve(
      USER_HOME_PATH,
      CLI_HOME,
      UPLOAD_CONFIG_FILT,
    );
    this.cwd = process.cwd();
    this.pkg = require(path.resolve(this.cwd, 'package.json'));

    try {
      this.abc = require(path.resolve(this.cwd, 'abc.json'));
    } catch (error) {
      this.abc = {};
    }
    this.init();
  }

  async init() {
    const hasConfigFile = fse.existsSync(path.resolve(this.configFilePath));
    let shouldInputConfig = !hasConfigFile;
    shouldInputConfig = this.options.reset ? true : shouldInputConfig;

    if (shouldInputConfig) {
      await this.saveUploadConfig();
    }

    this.exec();
  }

  printTipInfo() {
    console.log(
      chalk.blue(
        'Tips: The upload function uses ali-oss SDK, we need you to fill in some information.' +
          'You can fill it in with confidence. We will not obtain this information in any form. All information will be stored locally.',
      ),
    );
  }

  async saveUploadConfig() {
    this.printTipInfo();
    this.uploadConfig = await this.getUploadConfig();
    fse.ensureFileSync(this.configFilePath);
    fse.writeFileSync(
      this.configFilePath,
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
    this.uploadConfig = this.uploadConfig || require(this.configFilePath);
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
        path.resolve(this.cwd, this.abc?.uploadConfig?.sourceDir || 'dist'),
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
      return path.relative(this.cwd, file);
    });
    return fileNames;
  }

  getUrl(url: string) {
    const urlObject = new URL(url);
    const origin = this.abc?.uploadConfig?.domain || urlObject.origin;
    return origin + urlObject.pathname;
  }

  async putFile(filepath: string) {
    const spinner = ora('uploading: ' + filepath).start();
    const result = await this.client.put(
      path.join(this.abc?.uploadConfig?.targetDir || this.pkg.name, filepath),
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
