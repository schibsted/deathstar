import Logger from 'bunyan';
import { WebClient } from '@slack/web-api';
import { sleep, randomElement, colors } from './utils';
import { App } from './types';
import { config } from './config';

const log = Logger.createLogger({ name: 'deathstar' });
const slack = new WebClient(process.env.SLACK_TOKEN);

const appKey: string = randomElement(
  Object.keys(config).filter(k => k.startsWith(process.argv[2])),
);

if (!appKey) {
  log.error('There is no configured app that matches: %s', process.argv[2]);
  process.exit();
}
const appConfig: App = config[appKey];

(async () => {
  const messages: string[] = [
    ':vader2: _"You have failed me for the last time, Admiral..."_',
  ];
  const obj: any = {
    channel: appConfig.slackChannel,
    attachments: [
      {
        color: colors.black,
      },
    ],
  };
  obj.attachments[0].text = messages.join('\n\n');
  const result = await slack.chat.postMessage(obj);
  obj.ts = result.ts;
  await sleep(1000);

  messages.push(`:crosshair: Calibrating and aiming at *${appConfig.name}*`);
  obj.attachments[0].text = messages.join('\n\n');
  await slack.chat.update(obj);
  await sleep(1000);

  obj.attachments[0] = {
    ...obj.attachments[0],
    text: messages.join('\n\n'),
    footer: '',
    callback_id: `${appKey}`,
    actions: [
      {
        name: 'abort',
        text: 'Abort',
        type: 'button',
        value: 'abort',
      },
      {
        name: 'proceed',
        text: 'Proceed',
        type: 'button',
        value: 'proceed',
        style: 'danger',
        confirm: {
          title: 'Are you sure?',
          text: "Wouldn't you prefer a good game of chess?",
          ok_text: 'Do it!',
          dismiss_text: "Stop, I've changed my mind!",
        },
      },
    ],
  };
  await slack.chat.update(obj);
})();
