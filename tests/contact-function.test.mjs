import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handleContactRequest } from '../functions/api/contact.js';

const validEnv = {
  CONTACT_EMAIL_TO: 'eloundavilla@gmail.com',
  CONTACT_EMAIL_FROM: 'contact@traditional-homes.gr',
  CLOUDFLARE_ACCOUNT_ID: 'account-id',
  CLOUDFLARE_EMAIL_API_TOKEN: 'secret-token',
};

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

const withMutedConsoleError = async (callback) => {
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    return await callback();
  } finally {
    console.error = originalConsoleError;
  }
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
      validEnv,
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Please complete your name, email, and message.');
  });

  it('rejects honeypot submissions without sending email', async () => {
    let fetchCount = 0;
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Spam',
        email: 'spam@example.com',
        message: 'Hello',
        website: 'https://example.com',
      }),
      validEnv,
      async () => {
        fetchCount += 1;
        return new Response('{}');
      },
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Unable to send this message.');
    assert.equal(fetchCount, 0);
  });

  it('rejects valid submissions when REST API configuration is missing', async () => {
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Nikos',
        email: 'nikos@example.com',
        message: 'Please send availability details.',
      }),
      {
        CONTACT_EMAIL_TO: 'eloundavilla@gmail.com',
        CONTACT_EMAIL_FROM: 'contact@traditional-homes.gr',
      },
    );
    const body = await response.json();

    assert.equal(response.status, 500);
    assert.equal(body.error, 'Email service is not configured.');
  });

  it('sends valid messages through the Cloudflare Email Service REST API', async () => {
    let fetchUrl;
    let fetchOptions;
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Nikos',
        email: 'nikos@example.com',
        property: 'almond-tree-villa',
        message: 'Please send availability details.',
      }),
      validEnv,
      async (url, options) => {
        fetchUrl = url;
        fetchOptions = options;
        return Response.json({
          success: true,
          errors: [],
          messages: [],
          result: {
            delivered: ['eloundavilla@gmail.com'],
            permanent_bounces: [],
            queued: [],
          },
        });
      },
    );
    const body = await response.json();
    const sentMessage = JSON.parse(fetchOptions.body);

    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
    assert.equal(
      fetchUrl,
      'https://api.cloudflare.com/client/v4/accounts/account-id/email/sending/send',
    );
    assert.equal(fetchOptions.method, 'POST');
    assert.equal(
      fetchOptions.headers.authorization,
      'Bearer secret-token',
    );
    assert.equal(fetchOptions.headers['content-type'], 'application/json');
    assert.equal(sentMessage.to, 'eloundavilla@gmail.com');
    assert.deepEqual(sentMessage.from, {
      address: 'contact@traditional-homes.gr',
      name: 'Traditional Homes Contact Form',
    });
    assert.equal(sentMessage.reply_to, 'nikos@example.com');
    assert.match(sentMessage.subject, /almond-tree-villa/);
    assert.match(sentMessage.text, /Please send availability details\./);
  });

  it('returns an error when the Cloudflare REST API rejects the send', async () => {
    const response = await withMutedConsoleError(() =>
      handleContactRequest(
        makeFormRequest({
          name: 'Nikos',
          email: 'nikos@example.com',
          message: 'Please send availability details.',
        }),
        validEnv,
        async () =>
          Response.json(
            {
              success: false,
              errors: [
                {
                  code: 10102,
                  message: 'email.sending.error.authentication.forbidden',
                },
              ],
              messages: [],
              result: null,
            },
            { status: 403 },
          ),
      ),
    );
    const body = await response.json();

    assert.equal(response.status, 502);
    assert.equal(body.error, 'Unable to send this message.');
  });

  it('does not use an EMAIL send_email binding', async () => {
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Nikos',
        email: 'nikos@example.com',
        message: 'Please send availability details.',
      }),
      {
        EMAIL: {
          send: async () => {
            throw new Error('EMAIL binding should not be used');
          },
        },
        ...validEnv,
      },
      async () => Response.json({ success: true, result: { delivered: [] } }),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
  });
});
