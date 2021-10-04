/* eslint-disable no-param-reassign */
import Logger from 'bunyan';
import { ProbeResult, Simulation, SlackContext } from '../types';
import { disable } from '../clients/state-client';
import { probe } from '../clients/probe-client';
import { update, updateWithNewAttachment } from '../clients/slack-client';
import { sleep, statusEmoji, colors, randomElement } from '../utils';
import { introTemplates } from './templates/intro';
import { victoryTemplates } from './templates/victory';
import { outroTemplates } from './templates/outro';
import { defeatTemplates } from './templates/defeat';

const TIMEOUT_IN_MS = 45000;
const log = Logger.createLogger({ name: 'deathstar' });

const now = () => Math.floor(Date.now());

const statusMessage = (result: ProbeResult) =>
  `${statusEmoji(result.result)} Status *${result.status}* ${
    result.status !== (result.probeUrl.expectedStatus || 200)
      ? ` (expected ${result.probeUrl.expectedStatus || 200})`
      : ''
  } in *${result.totalTime}* ms from ${result.probeUrl?.url}`;

export const gatherProbeResults = async (
  ctx: SlackContext,
  iterator: AsyncGenerator<{ verify: ProbeResult[]; target: ProbeResult[] }>,
  headerMessage: string,
  targetMessage: string,
  verifyMessage: string,
) => {
  let result: ProbeResult[] = [];
  let curr = iterator.next();
  while (!(await curr).done) {
    const { target, verify } = (await curr).value;
    curr = iterator.next();
    ctx.messages = [];
    if (headerMessage) {
      ctx.messages.push(headerMessage);
    }

    if (targetMessage) {
      ctx.messages.push(targetMessage);
    }
    target.forEach((r: ProbeResult) => ctx.messages.push(statusMessage(r)));

    if (verifyMessage) {
      ctx.messages.push(verifyMessage);
    }
    verify.forEach((r: ProbeResult) => ctx.messages.push(statusMessage(r)));

    result = result
      .concat(target)
      .concat(verify)
      .filter(pr => !pr.result);

    ctx.color = result.length > 0 ? colors.red : colors.green;
    await update(ctx);
  }
  return result;
};

export async function* pingpong(
  simulation: Simulation,
  timeoutInMs: number = TIMEOUT_IN_MS,
) {
  const before: number = now();
  while (now() - before < timeoutInMs) {
    yield {
      target: await Promise.all(simulation.target.map(probe)),
      verify: await Promise.all(simulation.verify.map(probe)),
    };
    await sleep(500);
  }
}

export const intro = async (ctx: SlackContext) => {
  const i = randomElement(introTemplates);
  ctx.messages.push(i.text);
  ctx.image = i.image;
  await update(ctx);
};

export const victory = async (ctx: SlackContext) => {
  const i = randomElement(victoryTemplates);
  ctx.messages.push(i.text);
  ctx.image = i.image;
  ctx.color = colors.green;
  await update(ctx);
};

export const defeat = async (ctx: SlackContext) => {
  const i = randomElement(defeatTemplates);
  ctx.messages.push(i.text);
  ctx.image = i.image;
  ctx.color = colors.red;
  await update(ctx);
};

export const outro = async (ctx: SlackContext) => {
  const o = randomElement(outroTemplates);
  ctx.messages.push(o.text);
  ctx.image = o.image;
  ctx.color = colors.black;
  await update(ctx);
};

export const error = async (ctx: SlackContext, appKey: string, err: any) => {
  log.error('Uh-uh, something went wrong. Aborting...', err);
  await disable(appKey);
  ctx.messages = [':blob-scream: Uh-uh, something went wrong. Aborting...'];
  ctx.color = colors.red;
  await updateWithNewAttachment(ctx);
};

export const removeAttachments = (ctx: SlackContext, count: number) => {
  for (let i = 0; i < count; i++) {
    ctx.obj.attachments.pop();
  }
};
