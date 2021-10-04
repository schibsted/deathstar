/* eslint-disable no-param-reassign */
import r from 'koa-route';
import { Context } from 'koa';
import Logger from 'bunyan';
import { SlackSigChecker } from 'slack-sig-check';
import {
  ErrorSimulationProperties,
  ProbeResult,
  SimulationContext,
  SlackContext,
  SlowSimulationProperties,
} from '../types';
import { update, updateWithNewAttachment } from '../clients/slack-client';
import { runSimulation } from '../simulations/runSimulation';
import { colors, getSimulationContext, getSlackContext, sleep } from '../utils';
import { intro, outro, removeAttachments } from '../simulations/shared';

const log = Logger.createLogger({ name: 'deathstar' });
const slackSigChecker = new SlackSigChecker(
  process.env.SLACK_SIGNING_SECRET || '',
);

export const proceed = async (
  slackContext: SlackContext,
  simulationContext: SimulationContext,
) => {
  slackContext.messages = [
    `:green_lightsaber: Challenge accepted by <@${slackContext.user}>`,
  ];
  slackContext.color = slackContext.obj.attachments[0].color;

  await intro(slackContext);

  for (let i = 0; i < simulationContext.app.simulations.length; i++) {
    let result: ProbeResult[] = [];
    const simCtx = {
      appKey: simulationContext.appKey,
      app: simulationContext.app,
      simulation: simulationContext.app.simulations[i],
    };
    slackContext.obj.attachments.push({});
    await sleep(2000);

    switch (simCtx.simulation.type) {
      case 'error':
        result = await runSimulation(
          slackContext,
          simCtx,
          [
            `:death_star: Charging superlaser with the \`error\` simulation...`,
            `:tie_fighter: *${
              simulationContext.app.name
            }* mind controlled to always respond with status code *${
              (simCtx.simulation.properties as ErrorSimulationProperties).status
            }*.`,
          ],
          ':stormtrooper: Verifying that *attacked service is throwing errors*...',
          ':c-3po: ...and that *downstream service handles the errors as expected*...',
        );
        break;
      case 'slow':
        result = await runSimulation(
          slackContext,
          simCtx,
          [
            `:death_star: Charging superlaser with the \`slow\` simulation...`,
            `:tie_fighter: *${
              simulationContext.app.name
            }* mind controlled to delay requests with *${
              (simCtx.simulation.properties as SlowSimulationProperties).timeout
            }* ms.`,
          ],
          ':stormtrooper: Verifying that *attacked service is slooooooow*...',
          ':c-3po: ...and that *downstream service handles the slowness gracefully*...',
        );
        break;
      default:
        log.error('Invalid simulation type: %s', simCtx.simulation.type);
    }
    await update(slackContext);
    await sleep(3000);

    removeAttachments(slackContext, 4); // intro, warm-up, target, cool-down

    slackContext.messages = [
      `${result.length ? ':red_:' : ':green:'} ${simCtx.app.name} ${
        simCtx.simulation.type
      } ${simCtx.simulation.properties.whitelisted?.paths?.join(',') ?? ''}`,
    ];

    const report = new Set();
    result.forEach(pr => {
      if (!report.has(pr.probeUrl.url)) {
        report.add(pr.probeUrl.url);
        slackContext.messages.push(`${pr.probeUrl.url}`);
      }
    });

    slackContext.color = result.length ? colors.red : colors.green;
    await updateWithNewAttachment(slackContext);
  }

  slackContext.obj.attachments.push({});
  slackContext.messages = [];
  await outro(slackContext);
};

export const abort = async (slackContext: SlackContext) => {
  slackContext.messages = [
    `:blobstop: Challenge aborted by <@${slackContext.user}>`,
  ];
  slackContext.color = colors.red;
  await updateWithNewAttachment(slackContext);
};

const verifySignature = async (ctx: Context) => {
  const valid = await slackSigChecker.checkSignature(
    ctx.request.header['x-slack-signature'] as string,
    ctx.request.rawBody,
    ctx.request.header['x-slack-request-timestamp'] as string,
  );
  if (!valid) {
    ctx.throw(400, 'Invalid Slack signature');
  }
};

const slackHandler = async (ctx: Context) => {
  await verifySignature(ctx);
  const payload: any = JSON.parse(ctx.request.body.payload);
  const slackContext: SlackContext = getSlackContext(payload);
  const simulationContext: SimulationContext = getSimulationContext(payload);
  delete slackContext.obj.attachments[0].actions;
  if (payload.actions[0].value === 'proceed') {
    proceed(slackContext, simulationContext);
  } else {
    abort(slackContext);
  }
  ctx.body = '';
  ctx.status = 200;
};

export const slackRoute = r.post('/slack', slackHandler);
