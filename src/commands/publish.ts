import { RenderCommand, CommandType, Json } from '@x.render/render-command';

class PublishCommand extends RenderCommand {
  options: Json;

  constructor(rest: string, options: Json, cmd: CommandType) {
    super(rest, options, cmd);
    console.log(options);
  }
  init(): void {
    console.log('todo');
  }

  exec(): void {}
}

export = (rest: string, options: Json, cmd: CommandType) => {
  return new PublishCommand(rest, options, cmd);
};
