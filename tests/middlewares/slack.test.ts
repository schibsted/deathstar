import { abort, proceed } from '../../src/middlewares/slack';
import { updateWithNewAttachment } from '../../src/clients/slack-client';
import { SimulationContext, SlackContext } from '../../src/types';
import { colors } from '../../src/utils';
import { runSimulation } from '../../src/simulations/runSimulation';
import { outroTemplates } from '../../src/simulations/templates/outro';

jest.mock('../../src/simulations/runSimulation');
jest.mock('slack-sig-check');
jest.mock('../../src/clients/slack-client');
jest.setTimeout(10000);
// @ts-ignore
runSimulation.mockImplementation(async () => []);

const slackContextTemplate: SlackContext = {
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

it('should abort', async () => {
  const ctx: SlackContext = slackContextTemplate;
  await abort(ctx);
  expect(ctx.messages).toEqual([`:blobstop: Challenge aborted by <@test>`]);
  expect(ctx.image).toBeUndefined();
  expect(ctx.color).toEqual(colors.red);
  expect(updateWithNewAttachment).toHaveBeenCalledWith(ctx);
});

it('should proceed with the error simulation', async () => {
  const slackContext: SlackContext = slackContextTemplate;
  const simulationContext: SimulationContext = {
    appKey: 'my appKey',
    app: {
      name: 'app name',
      slackChannel: 'slack channel',
      simulations: [
        {
          type: 'error',
          properties: {
            status: 500,
            whitelisted: {
              paths: ['/status'],
            },
          },
          target: [
            {
              url: 'target url',
            },
          ],
          verify: [
            {
              url: 'verify url',
            },
          ],
        },
      ],
    },
    simulation: {
      type: 'error',
      properties: {
        status: 500,
        whitelisted: {
          paths: ['/status'],
        },
      },
      target: [
        {
          url: 'target url',
        },
      ],
      verify: [
        {
          url: 'verify url',
        },
      ],
    },
  };
  await proceed(slackContext, simulationContext);
  expect(outroTemplates.map(t => t.text).join()).toContain(
    slackContext.messages.pop() || 'This is clearly wrong',
  );
  expect(slackContext.image).toBeDefined();
  expect(slackContext.color).toEqual('080710');
  expect(runSimulation).toHaveBeenCalledWith(
    slackContext,
    simulationContext,
    [
      ':death_star: Charging superlaser with the `error` simulation...',
      ':tie_fighter: *app name* mind controlled to always respond with status code *500*.',
    ],
    ':stormtrooper: Verifying that *attacked service is throwing errors*...',
    ':c-3po: ...and that *downstream service handles the errors as expected*...',
  );
});

it('should proceed with the slow simulation', async () => {
  const slackContext: SlackContext = slackContextTemplate;
  const simulationContext: SimulationContext = {
    appKey: 'my appKey',
    app: {
      name: 'app name',
      slackChannel: 'slack channel',
      simulations: [
        {
          type: 'slow',
          properties: {
            timeout: 10000,
            whitelisted: {
              paths: ['/status'],
            },
          },
          target: [
            {
              url: 'https://target.url',
            },
          ],
          verify: [
            {
              url: 'https://verify.url',
            },
          ],
        },
      ],
    },
    simulation: {
      type: 'slow',
      properties: {
        timeout: 10000,
        whitelisted: {
          paths: ['/status'],
        },
      },
      target: [
        {
          url: 'https://target.url',
        },
      ],
      verify: [
        {
          url: 'https://verify.url',
        },
      ],
    },
  };
  await proceed(slackContext, simulationContext);
  expect(outroTemplates.map(t => t.text).join()).toContain(
    slackContext.messages.pop() || 'This is clearly wrong',
  );
  expect(slackContext.image).toBeDefined();
  expect(slackContext.color).toEqual('080710');
  expect(updateWithNewAttachment).toHaveBeenCalledWith(slackContext);
  expect(runSimulation).toHaveBeenCalledWith(
    slackContext,
    simulationContext,
    [
      ':death_star: Charging superlaser with the `slow` simulation...',
      ':tie_fighter: *app name* mind controlled to delay requests with *10000* ms.',
    ],
    ':stormtrooper: Verifying that *attacked service is slooooooow*...',
    ':c-3po: ...and that *downstream service handles the slowness gracefully*...',
  );
});
