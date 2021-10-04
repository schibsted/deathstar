import nock from 'nock';
import {
  victory,
  outro,
  error,
  intro,
  pingpong,
} from '../../src/simulations/shared';
import {
  update,
  updateWithNewAttachment,
} from '../../src/clients/slack-client';
import { disable } from '../../src/clients/state-client';
import { ProbeResult, Simulation, SlackContext } from '../../src/types';

jest.mock('../../src/clients/slack-client');
jest.mock('../../src/clients/state-client');

jest.mock('../../src/utils', () => ({
  randomElement: () => ({
    text: 'my text',
    image: 'my image',
  }),
  colors: {
    red: 'red',
  },
  sleep: async (ms: number) => {
    // eslint-disable-next-line promise/avoid-new
    await new Promise(resolve => setTimeout(resolve, ms));
  },
}));

describe('pingpong', () => {
  const simulation: Simulation = {
    type: 'error',
    properties: {
      status: 567,
      whitelisted: {
        paths: ['/status'],
      },
    },
    target: [
      {
        expectedStatus: 567,
        url: 'https://example.com',
      },
    ],
    verify: [
      {
        url: 'https://example.se',
      },
    ],
  };

  const playPingpong: () => Promise<ProbeResult[]> = async () => {
    const iterator: AsyncGenerator<{
      verify: ProbeResult[];
      target: ProbeResult[];
    }> = pingpong(simulation, 1000);
    let curr = iterator.next();
    let result: ProbeResult[] = [];
    while (!(await curr).done) {
      const { target, verify } = (await curr).value;
      curr = iterator.next();
      result = result.concat(target.concat(verify));
    }
    return result;
  };
  it('returns a list of ProbeResult void of result===false if everything goes well', async () => {
    nock('https://example.com').get('/').reply(567, {}).persist();
    nock('https://example.se').get('/').reply(200, {}).persist();

    expect(
      (await playPingpong()).filter(
        (probeResult: ProbeResult) => !probeResult.result,
      ),
    ).toEqual([]);
  });

  beforeEach(() => {
    nock.cleanAll();
    nock.disableNetConnect();
  });

  it('returns a list of ProbeResult containing result===false if verify probe fails', async () => {
    nock('https://example.com').get('/').reply(567, {}).persist();
    nock('https://example.se').get('/').reply(567, {}).persist();
    expect(
      (await playPingpong()).filter(
        (probeResult: ProbeResult) => !probeResult.result,
      ).length > 0,
    ).toBeTruthy();
  });

  it('returns a list of ProbeResult containing result===false if target probe fails', async () => {
    nock('https://example.com').get('/').reply(200, {}).persist();
    nock('https://example.se').get('/').reply(200, {}).persist();
    expect(
      (await playPingpong()).filter(
        (probeResult: ProbeResult) => !probeResult.result,
      ).length > 0,
    ).toBeTruthy();
  });
});

it('should update intro', async () => {
  const ctx: SlackContext = {
    messages: ['hello', 'world'],
    obj: {
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
      ],
    },
    color: 'foo',
    user: 'test',
  };
  await intro(ctx);
  expect(ctx.messages[2]).toEqual('my text');
  expect(ctx.image).toEqual('my image');
  expect(update).toHaveBeenCalledWith(ctx);
});

it('should update victory', async () => {
  const ctx: SlackContext = {
    messages: ['hello', 'world'],
    obj: {
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
      ],
    },
    color: 'foo',
    user: 'test',
  };
  await victory(ctx);
  expect(ctx.messages[2]).toEqual('my text');
  expect(ctx.image).toEqual('my image');
  expect(update).toHaveBeenCalledWith(ctx);
});

it('should update outro', async () => {
  const ctx: SlackContext = {
    messages: ['hello', 'world'],
    obj: {
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
      ],
    },
    color: 'foo',
    user: 'test',
  };
  await outro(ctx);
  expect(ctx.messages[2]).toEqual('my text');
  expect(ctx.image).toEqual('my image');
  expect(update).toHaveBeenCalledWith(ctx);
});

it('should update error', async () => {
  const ctx: SlackContext = {
    messages: ['hello', 'world'],
    obj: {
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
      ],
    },
    color: 'foo',
    user: 'test',
  };
  await error(ctx, 'my appKey', 'my error');
  expect(ctx.messages).toEqual([
    ':blob-scream: Uh-uh, something went wrong. Aborting...',
  ]);
  expect(ctx.image).toBeUndefined();
  expect(ctx.color).toEqual('red');
  expect(updateWithNewAttachment).toHaveBeenCalledWith(ctx);
  expect(disable).toHaveBeenCalledTimes(1);
});
