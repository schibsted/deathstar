import { enable, disable } from '../../src/clients/state-client';

jest.mock('aws-sdk/clients/s3', () => class S3 {
    putObject = (params: any) => ({
        promise: () => {
          if (params.Key === 'disable') {
            expect(params.Body).toEqual(JSON.stringify({}));
          }
          if (params.Key === 'enable') {
            expect(params.Body).toEqual(
              JSON.stringify({
                type: 'my-type',
                foo: 'my-foo',
              }),
            );
          }
          return {};
        },
      });
  });

it('disable', async () => {
  await disable('disable');
});

it('enable', async () => {
  await enable('enable', {
    type: 'my-type',
    properties: {
      foo: 'my-foo',
    },
  });
});
