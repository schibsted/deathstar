import {
  callbackIdtoAppKey,
  callbackIdtoSimulationId,
  sleep,
  statusEmoji,
  getSlackContext,
  getSimulationContext,
} from '../src/utils';

jest.mock('../src/config', () => ({
  config: {
    'foo/bar': {
      name: 'Foo API',
      simulations: [
        {
          type: 'error',
        },
        {
          type: 'slow',
        },
      ],
    },
  },
}));

it('should sleep for x milliseconds', () => {
  jest.useFakeTimers();
  sleep(1000);
  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});

it('Should extract app key from callback id, as a string', () => {
  expect(callbackIdtoAppKey('foo/bar/42')).toEqual('foo/bar');
});

it('Should extract simulation id from callback id, as a number', () => {
  expect(callbackIdtoSimulationId('foo/bar/42')).toEqual(42);
});

it('Should return emoji based on boolean result', () => {
  expect(statusEmoji(true)).toEqual(':green:');
  expect(statusEmoji(false)).toEqual(':red_:');
});

it('Should parse Slack payload into a SlackContext', () => {
  expect(
    getSlackContext({
      original_message: {
        text: 'org text',
        ts: 'org ts',
        attachments: [
          {
            text: 'first',
            color: 'black',
          },
          {
            text: 'foo\n\nbar',
            color: 'pink',
          },
        ],
      },
      channel: {
        id: 'channel id',
      },
      user: {
        name: 'user name',
      },
    }),
  ).toEqual({
    obj: {
      text: 'org text',
      ts: 'org ts',
      channel: 'channel id',
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
        {
          text: 'foo\n\nbar',
          color: 'pink',
        },
      ],
    },
    color: 'pink',
    messages: ['foo', 'bar'],
    user: 'user name',
  });
});

it('Should parse Slack payload into a SimulationContext', () => {
  expect(getSimulationContext({ callback_id: 'foo/bar/0' })).toEqual({
    appKey: 'foo/bar',
    app: {
      name: 'Foo API',
      simulations: [
        {
          type: 'error',
        },
        {
          type: 'slow',
        },
      ],
    },
    simulation: {
      type: 'error',
    },
  });
});
