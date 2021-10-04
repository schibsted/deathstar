import { config } from './config';
import { App, Simulation } from './types';

export const sleep = async (ms: number) => {
  // eslint-disable-next-line promise/avoid-new
  await new Promise(resolve => setTimeout(resolve, ms));
};

export const randomIndex = (arr: any[]) => Math.floor(Math.random() * arr.length);

export const randomElement = (arr: any[]) => arr[randomIndex(arr)];

export const lastElement = (arr: any[]) => arr[arr.length - 1];

export const callbackIdtoAppKey = (callbackId: string) => callbackId.split('/').splice(0, 2).join('/');

export const callbackIdtoSimulationId = (callbackId: string) => parseInt(callbackId.split('/').splice(2, 3).toString(), 10);

export const statusEmoji = (result: boolean) => (result ? ':green:' : ':red_:');

export const colors = {
  black: '080710',
  green: '089510',
  red: 'E01E5A',
};

export const getSlackContext = (payload: any) => {
  const obj: any = {
    text: payload.original_message.text,
    ts: payload.original_message.ts,
    channel: payload.channel.id,
    attachments: payload.original_message.attachments,
  };
  return {
    obj,
    user: payload.user.name,
    color: lastElement(obj.attachments).color,
    messages: lastElement(obj.attachments).text.split('\n\n'),
  };
};

export const getSimulationContext = (payload: any) => {
  const appKey: string = callbackIdtoAppKey(payload.callback_id);
  const app: App = config[appKey];
  const simulation: Simulation =
    app.simulations[callbackIdtoSimulationId(payload.callback_id)];
  return {
    appKey,
    app,
    simulation,
  };
};
