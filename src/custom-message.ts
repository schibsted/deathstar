import { WebClient } from '@slack/web-api';
import { randomElement } from './utils';

const slack = new WebClient(process.env.SLACK_TOKEN);

const quotes: string[] = [
  '*KHOOOOH PUUUHRR*',
  ':notes: _Dun Dun Dun dun DUN Dun dun DUN Dun..._',
];

(async () => {
  await slack.chat.postMessage({
    channel: 'G0141JJP0P9',
    text: randomElement(quotes),
  });
})();
