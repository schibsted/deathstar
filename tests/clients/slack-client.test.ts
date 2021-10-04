import {
  MockedWebClient,
  MockWebClient,
} from '@slack-wrench/jest-mock-web-client';
import {
  update,
  updateWithNewAttachment,
} from '../../src/clients/slack-client';

const client: MockWebClient = MockedWebClient.mock.instances[0];

it('should update with text only', async () => {
  await update({
    messages: ['hello', 'world'],
    obj: {
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
        {
          text: 'hello',
          color: 'green',
        },
      ],
    },
    color: 'foo',
    user: 'test',
  });
  expect(client.chat.update).toHaveBeenCalledWith({
    attachments: [
      {
        text: 'first',
        color: 'black',
      },
      {
        text: 'hello\nworld',
        color: 'foo',
      },
    ],
  });
});

it('should update with text and image', async () => {
  await update({
    messages: ['hello', 'world'],
    obj: {
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
        {
          text: 'hello',
          color: 'green',
        },
      ],
    },
    color: 'foo',
    user: 'test',
    image: 'my image',
  });
  expect(client.chat.update).toHaveBeenCalledWith({
    attachments: [
      {
        text: 'first',
        color: 'black',
      },
      {
        text: 'hello\nworld',
        color: 'foo',
        image_url: 'my image',
      },
    ],
  });
});

it('should update with text and create new attachment', async () => {
  await updateWithNewAttachment({
    messages: ['hello', 'world'],
    obj: {
      attachments: [
        {
          text: 'first',
          color: 'black',
        },
        {
          text: 'second',
          color: 'green',
        },
      ],
    },
    color: 'foo',
    user: 'test',
  });
  expect(client.chat.update).toHaveBeenCalledWith({
    attachments: [
      {
        text: 'first',
        color: 'black',
      },
      {
        text: 'second',
        color: 'green',
      },
      {
        text: 'hello\nworld',
        color: 'foo',
      },
    ],
  });
});
