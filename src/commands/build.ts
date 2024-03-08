import { RenderCommand, CommandType, Json } from '@x.render/render-command';

class BuildCommand extends RenderCommand {
  options: Json;

  constructor(rest: string, options: Json, cmd: CommandType) {
    super(rest, options, cmd);
    console.log(options);
  }
  init(): void {}

  exec(): void {}
}

export = (rest: string, options: Json, cmd: CommandType) => {
  return new BuildCommand(rest, options, cmd);
};
