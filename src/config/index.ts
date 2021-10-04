import { App, TrafficPattern } from '../types';

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
  },
};

const blacklisted: TrafficPattern = {
  paths: ['/some-super-important-path'],
};

export const config: Record<string, App> = {
  'my-org/my-app': {
    name: 'MyApp',
    slackChannel: 'FOOBAR',
    simulations: [
      {
        type: 'slow',
        properties: {
          timeout: 10000,
          whitelisted: {
            paths: ['/'],
          },
          blacklisted,
        },
        target: [
          {
            url: 'https://target.under.attack/blih/blah',
            ...headers,
          },
        ],
        verify: [
          {
            url: 'https://should.be.unaffected/blih/blah',
            ...headers,
          },
        ],
      },
      {
        type: 'error',
        properties: {
          status: 555,
          whitelisted: {
            paths: ['/'],
          },
          blacklisted,
        },
        target: [
          {
            url: 'https://target.under.attack/blih/blah',
            ...headers,
          },
        ],
        verify: [
          {
            url: 'https://should.be.unaffected/blih/blah',
            ...headers,
          },
        ],
      },
    ],
  },
};
