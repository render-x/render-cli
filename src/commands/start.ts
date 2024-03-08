import { RenderCommand, CommandType, Json } from '@x.render/render-command';
import { spawnSync } from 'child_process';
import { log } from '@x.render/render-node-utils';

class StartCommand extends RenderCommand {
  options: Json;

  constructor(rest: string, options: Json, cmd: CommandType) {
    super(rest, options, cmd);
    this.exec();
  }
  init(): void {
    // TODO
  }

  exec(): void {
    const nProcessArgv = process.argv.slice(2);

    const result = spawnSync(
      'npx',
      ['render-builder', 'start', ...nProcessArgv],
      {
        stdio: ['inherit', 'inherit', 'inherit'],
      },
    );

    if (result.signal) {
      if (result.signal) {
        if (result.signal === 'SIGKILL') {
          log.warn(
            'The build failed because the process exited too early. ' +
              'This probably means the system ran out of memory or someone called ' +
              '`kill -9` on the process.',
          );
        } else if (result.signal === 'SIGTERM') {
          log.warn(
            'The build failed because the process exited too early. ' +
              'Someone might have called `kill` or `killall`, or the system could ' +
              'be shutting down.',
          );
        }
        process.exit(1);
      }
    }
    process.exit(result.status);
  }
}

export = (rest: string, options: Json, cmd: CommandType) => {
  return new StartCommand(rest, options, cmd);
};
