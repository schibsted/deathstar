/* eslint-disable no-param-reassign */
import { colors, sleep } from '../utils';
import {
  SlackContext,
  SimulationContext,
  Simulation,
  ProbeUrl,
  ProbeResult,
} from '../types';
import { enable, disable } from '../clients/state-client';
import { update, updateWithNewAttachment } from '../clients/slack-client';
import { error, gatherProbeResults, pingpong, victory, defeat } from './shared';

export const warmUp = async (
  slackContext: SlackContext,
  simulation: Simulation,
  messages: string[],
) => {
  slackContext.messages = messages;
  slackContext.color = colors.black;
  await update(slackContext);
  await sleep(7500);
  slackContext.messages = [];
  await updateWithNewAttachment(slackContext);
  await gatherProbeResults(
    slackContext,
    pingpong(simulation),
    ':r2d2-2: Verifying everything is working before commencing...',
    '',
    '',
  );
};

export const targetVerify = async (
  slackContext: SlackContext,
  simulationContext: SimulationContext,
  targetMessage: string,
  verifyMessage: string,
) => {
  await enable(simulationContext.appKey, simulationContext.simulation);
  await sleep(7500);
  slackContext.messages = [];
  await updateWithNewAttachment(slackContext);
  const result = await gatherProbeResults(
    slackContext,
    pingpong(simulationContext.simulation),
    '',
    targetMessage,
    verifyMessage,
  );
  await disable(simulationContext.appKey);
  if (result.length) {
    await defeat(slackContext);
  } else {
    await victory(slackContext);
  }
  await sleep(7500);
  return result;
};

export const coolDown = async (
  slackContext: SlackContext,
  simulation: Simulation,
) => {
  slackContext.messages = [];
  await updateWithNewAttachment(slackContext);
  await gatherProbeResults(
    slackContext,
    pingpong(simulation),
    ':r2d2-2: Verifying that app is healthy again...',
    '',
    '',
  );
};

export const runSimulation = async (
  slackContext: SlackContext,
  simulationContext: SimulationContext,
  warmUpMessages: string[],
  targetMessage: string,
  verifyMessage: string,
): Promise<ProbeResult[]> => {
  try {
    const simulationCopy = JSON.parse(
      JSON.stringify(simulationContext.simulation),
    );
    simulationCopy.target = simulationCopy.target.map((probeUrl: ProbeUrl) => ({
      ...probeUrl,
      expectedStatus: 200,
    }));

    await warmUp(slackContext, simulationCopy, warmUpMessages);
    const result = await targetVerify(
      slackContext,
      simulationContext,
      targetMessage,
      verifyMessage,
    );
    await coolDown(slackContext, simulationCopy);
    return result;
  } catch (err) {
    await error(slackContext, simulationContext.appKey, err);
  }
  return [];
};
