import path = require('path');

import chalk = require('chalk');
import semver = require('semver');
import fse = require('fs-extra');
import os = require('os');
import Package from '@x.render/render-package';
import ora, { Ora } from 'ora';
import { log, clearConsole } from '@x.render/render-node-utils';
import validateProjectName = require('validate-npm-package-name');
import { RenderCommand, CommandType, Json } from '@x.render/render-command';

import { APP_LIST } from '../constant';

interface Options extends Json {
  force: boolean;
  update: boolean;
}
const inquirer = require('inquirer');

const prompt = inquirer.prompt;
class InitCommand extends RenderCommand {
  force: string | boolean;
  appName: string;
  appVersion: string;
  pkgName: string;
  package: Package;
  spinner: Ora;

  constructor(rest: string, options: Options, cmd: CommandType) {
    super(rest, options, cmd);
    this.force = false;
    this.appName = null;
    this.appVersion = null;
    this.pkgName = null;
    this.package = null;
    this.init();
  }
  async init() {
    const { force } = this.options;
    this.force = force;
    const { pkgName, appName, appVersion } = await this.getAppInfo();
    this.appName = appName;
    this.pkgName = pkgName;
    this.appVersion = appVersion;
    this.package = new Package({
      storePath: 'packages',
      pkgName,
    });
    this.exec();
  }

  async getAppInfo() {
    return {
      pkgName: await this.getAppType(),
      appName: await this.getAppName(),
      appVersion: await this.getAppVersion(),
    };
  }

  async getAppType(): Promise<string> {
    const { pkgName }: { pkgName: string } = await prompt({
      type: 'list',
      name: 'pkgName',
      message: 'Please select the application type',
      choices: APP_LIST,
    });

    return pkgName;
  }

  async getAppName(): Promise<string> {
    const { appName }: { appName: string } = await prompt({
      type: 'input',
      name: 'appName',
      default: 'render-app',
      message: 'Please enter the applicaiton name:',
      validate(name: string) {
        const done = this.async();
        setTimeout(() => {
          const validationResult = validateProjectName(name);
          if (!validationResult.validForNewPackages) {
            const errMsg: string[] = [];
            const tips = '\n   Please enter a new name';
            [
              ...(validationResult.errors || []),
              ...(validationResult.warnings || []),
            ].forEach((error) => {
              errMsg.push(`\n   * ${error}`);
            });
            done(
              chalk.red(
                'The application name ' +
                  chalk.blue.bold(`'${name}'`) +
                  ' does not follow the npm package naming convention:' +
                  errMsg.join('') +
                  tips,
              ),
            );
            return;
          }
          done(null, true);
        }, 0);
      },
    });
    return appName;
  }

  async getAppVersion(): Promise<string> {
    const { appVersion }: { appVersion: string } = await prompt({
      type: 'input',
      name: 'appVersion',
      default: '1.0.0',
      message: 'Please enter the application version:',
      validate(value: string) {
        const done = this.async();
        setTimeout(() => {
          if (!semver.valid(value)) {
            done(chalk.red('Please enter a valid version'));
            return;
          }
          done(null, true);
        }, 0);
      },
    });
    return appVersion;
  }

  async exec() {
    const isContinue = await this.checkCanContinue();
    if (!isContinue) {
      process.exit(1);
    }
    clearConsole();
    this.setSpinner();
    const isPkgExist = await this.package.isLocalPkgExist();
    this.spinner.stop();
    if (!isPkgExist) {
      log.debug(
        'No corresponding version of the' +
          this.pkgName +
          ' found locally, ' +
          'starting to download from the network',
      );
      await this.package.install();
    }
    const soureDirPath = await this.package.getPkgCachePath();
    const targetPath = process.env.LOCAL_DEV_PATH || path.resolve(this.appName);

    fse.removeSync(targetPath);
    fse.ensureDirSync(soureDirPath);
    fse.ensureDirSync(targetPath);
    // 模版文件复制到目标文件夹
    fse.copySync(path.join(soureDirPath, 'template'), targetPath);

    const pkgJsonPath = path.resolve(targetPath, 'package.json');
    const pkgJson: Json = fse.readJSONSync(pkgJsonPath);
    pkgJson.name = this.appName;
    pkgJson.version = this.appVersion;
    fse.writeJsonSync(path.resolve(targetPath, 'package.json'), pkgJson, {
      spaces: 2,
      EOL: os.EOL,
    });

    log.info(`🎉 Successfully created app ${this.appName}`);
    log.info('👉 Get started with the following commands:');
    console.log();
    console.log(`${chalk.blue(`$ cd ${this.appName}`)}`);
    console.log(`${chalk.blue('$ npm i')}`);
    console.log();
  }

  async checkCanContinue(): Promise<Boolean> {
    const cwdPath = process.env.LOCAL_DEV_PATH || path.resolve(this.appName);
    if (!this.isCwdPathEmpty(cwdPath)) {
      if (!this.force) {
        const { isContinue }: { isContinue: Boolean } = await prompt({
          type: 'confirm',
          name: 'isContinue',
          default: true,
          message: chalk.yellow(
            'Current directory (' +
              this.appName +
              ') is not empyt. ' +
              'Do you want to continue with the operation:',
          ),
        });
        if (!isContinue) {
          return;
        }
      }
      const { isDelete }: { isDelete: Boolean } = await prompt({
        type: 'confirm',
        name: 'isDelete',
        default: true,
        message: chalk.yellow(
          'Continuing with the operation will delete ' +
            'all the files in the current directory (' +
            this.appName +
            ') :',
        ),
      });

      return isDelete;
    }
    return true;
  }

  isCwdPathEmpty(cwdPath: string) {
    fse.ensureDirSync(cwdPath);
    const fileList = fse.readdirSync(cwdPath);
    return !fileList || fileList.length === 0;
  }

  setSpinner() {
    this.spinner = ora('').start();
    this.spinner.color = 'yellow';
    this.spinner.text = 'starting to download\n';
  }
}

export = (rest: string, options: Options, cmd: CommandType) => {
  return new InitCommand(rest, options, cmd);
};
