import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handleContactRequest } from '../functions/api/contact.js';

const makeFormRequest = (fields) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return new Request('https://traditional-homes.gr/api/contact', {
    method: 'POST',
    body: formData,
  });
};

describe('contact Pages Function', () => {
  it('rejects non-POST requests', async () => {
    const response = await handleContactRequest(
      new Request('https://traditional-homes.gr/api/contact', {
        method: 'GET',
      }),
      {},
    );

    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'POST');
  });

  it('rejects missing required fields', async () => {
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Guest',
        email: '',
        message: 'Hello',
      }),
      { EMAIL: { send: async () => ({ messageId: 'not-used' }) } },
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Please complete your name, email, and message.');
  });

  it('rejects honeypot submissions without sending email', async () => {
    let sendCount = 0;
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Spam',
        email: 'spam@example.com',
        message: 'Hello',
        website: 'https://example.com',
      }),
      {
        EMAIL: {
          send: async () => {
            sendCount += 1;
          },
        },
      },
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Unable to send this message.');
    assert.equal(sendCount, 0);
  });

  it('sends valid messages to the configured inbox', async () => {
    let sentMessage;
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Nikos',
        email: 'nikos@example.com',
        property: 'almond-tree-villa',
        message: 'Please send availability details.',
      }),
      {
        CONTACT_EMAIL_FROM: 'contact@traditional-homes.gr',
        EMAIL: {
          send: async (message) => {
            sentMessage = message;
            return { messageId: 'message-1' };
          },
        },
      },
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
    assert.equal(sentMessage.to, 'eloundavilla@gmail.com');
    assert.deepEqual(sentMessage.from, {
      email: 'contact@traditional-homes.gr',
      name: 'Traditional Homes Contact Form',
    });
    assert.equal(sentMessage.replyTo, 'nikos@example.com');
    assert.match(sentMessage.subject, /almond-tree-villa/);
    assert.match(sentMessage.text, /Please send availability details\./);
  });
});
