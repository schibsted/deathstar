import { WebClient } from '@slack/web-api';
import { SlackContext } from '../types';

const slack = new WebClient(process.env.SLACK_TOKEN);

const index = (ctx: SlackContext) => ctx.obj.attachments.length - 1;

export const update = async (ctx: SlackContext) => {
  ctx.obj.attachments[index(ctx)].text = ctx.messages.join('\n');
  ctx.obj.attachments[index(ctx)].color = ctx.color;
  if (ctx.image) {
    ctx.obj.attachments[index(ctx)].image_url = ctx.image;
    delete ctx.image;
  }
  await slack.chat.update(ctx.obj);
};

export const updateWithNewAttachment = async (ctx: SlackContext) => {
  ctx.obj.attachments.push({});
  await update(ctx);
};
