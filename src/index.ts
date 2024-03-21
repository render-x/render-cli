#!/usr/bin/env node

import rootCheck = require('root-check');
import semver = require('semver');
import fs = require('fs');
import initCommand = require('./commands/init');
import startCommand = require('./commands/start');
import buildCommand = require('./commands/build');
import uploadCommand = require('./commands/upload');

import { similar, log } from '@x.render/render-node-utils';
import { CLI_NAME, USER_HOME_PATH } from './constant';
import { program } from 'commander';

const pkg = require('../package.json');

const prepare = async () => {
  checkNodeVersion(pkg.engines.node);
  checkIsRoot();
  checkUSER_HOME_PATH();
};

const checkNodeVersion = (requireNodeVersion: string) => {
  const currentVersion = process.version;
  if (!semver.satisfies(currentVersion, requireNodeVersion)) {
    const errMsg =
      'The current Node version is ' +
      currentVersion +
      ', and ' +
      CLI_NAME +
      ' requires Node version ' +
      requireNodeVersion +
      ' or above to be used. ' +
      'Please update the Node version.';
    throw new Error(errMsg);
  }
};

const checkIsRoot = () => rootCheck();

const checkUSER_HOME_PATH = () => {
  if (!USER_HOME_PATH || !fs.existsSync(USER_HOME_PATH)) {
    throw new Error("The current user's home directory does not exist.");
  }
};

const registerCommand = () => {
  program
    .version(pkg.version, '-v, --version', 'output the version number')
    .name(CLI_NAME)
    .usage('<command> [options]');

  program
    .option('-d, --debug', 'enable debug mode', false)
    .option(
      '-tp, --testPath <testPath>',
      'specify the local test directory for development',
    );

  // initialize the render app
  program
    .command('init [command]')
    .description('Download app')
    .option('-f, --force', 'force download app', false)
    .action((...arg) => {
      initCommand(arg[0], arg[1], arg[2]);
    });

  program
    .command('start [command]')
    .description('Run app')
    .option('--config [config]', 'specify configuration file location')
    .action((...arg) => {
      startCommand(arg[0], arg[1], arg[2]);
    });

  program
    .command('build [command]')
    .description('Build  app')
    .option('--config [config]', 'specify configuration file location')
    .action((...arg) => {
      buildCommand(arg[0], arg[1], arg[2]);
    });

  program
    .command('upload [command]')
    .description(
      'Upload your files to Alibaba Cloud OSS\n\n' +
        'The directory to be uploaded and the directory after uploading can be configured in the abc.json file in the project.\n\n' +
        'uploadConfig.sourceDir indicates the directory to be uploaded. The default value is: dist.\n\n' +
        'uploadConfig.target represents the directory after uploading. The default value is: name in package.json in the project root directory.\n',
    )
    .option('-r, --reset', 'reset upload config')
    .action((...arg) => {
      uploadCommand(arg[0], arg[1], arg[2]);
    });

  // command tips
  program.on('command:*', (unavailableCommands) => {
    const unknownCommandName = unavailableCommands[0];
    log.error(`unknown command '${unknownCommandName}'`);

    let maxIndex = 0;
    let result = 0;
    program.commands.forEach((cmd, index) => {
      const res = similar(cmd.name(), unknownCommandName);
      if (res > result) {
        result = res;
        maxIndex = index;
      }
    });
    if (result) {
      console.log(
        `Do you mean is "${program.commands[maxIndex].name()}" command`,
      );
    }
  });

  // enable debug mode
  program.on('option:debug', () => {
    log.setLogLevel('debug');
  });

  program.on('option:testPath', () => {
    process.env.LOCAL_DEV_PATH = program.opts().testPath;
  });

  program.parse(process.argv);
};

const CatchGlobalErrors = () => {
  const printErrorInfo = (error: Error) => {
    log.error(error.stack || error.message);
    process.exit(1);
  };
  process.on('uncaughtException', printErrorInfo);
  process.on('unhandledRejection', printErrorInfo);
};

(async () => {
  CatchGlobalErrors();
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    log.error((e as Error).stack);
    process.exit(1);
  }
})();
