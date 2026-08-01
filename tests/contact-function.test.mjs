import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handleContactRequest } from '../functions/api/contact.js';

const validEnv = {
  TURNSTILE_SECRET_KEY: 'turnstile-secret',
  CONTACT_EMAIL_TO: 'info@traditional-homes.gr',
  CONTACT_EMAIL_FROM: 'contact@traditional-homes.gr',
  CLOUDFLARE_ACCOUNT_ID: 'account-id',
  CLOUDFLARE_EMAIL_API_TOKEN: 'secret-token',
};

const validSubmission = {
  name: 'Nikos',
  email: 'nikos@example.com',
  property: 'almond-tree-villa',
  message: 'Please send availability details.',
  'cf-turnstile-response': 'valid-turnstile-token',
};

const makeFormRequest = (fields, headers = {}) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return new Request('https://traditional-homes.gr/api/contact', {
    method: 'POST',
    body: formData,
    headers,
  });
};

const withCapturedConsoleError = async (callback) => {
  const originalConsoleError = console.error;
  const calls = [];
  console.error = (...args) => calls.push(args);

  try {
    return { result: await callback(), calls };
  } finally {
    console.error = originalConsoleError;
  }
};

const turnstileSuccess = (overrides = {}) =>
  Response.json({
    success: true,
    action: 'contact',
    hostname: 'traditional-homes.gr',
    ...overrides,
  });

const emailSuccess = () =>
  Response.json({ success: true, result: { delivered: [] } });

const fetchWithTurnstile = (siteverifyResponse, emailResponse = emailSuccess()) => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return url.includes('/turnstile/v0/siteverify')
      ? siteverifyResponse
      : emailResponse;
  };
  return { fetchImpl, calls };
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

  it('rejects missing required fields before Turnstile verification', async () => {
    let fetchCount = 0;
    const response = await handleContactRequest(
      makeFormRequest({
        name: 'Guest',
        email: '',
        message: 'Hello',
        'cf-turnstile-response': 'valid-turnstile-token',
      }),
      validEnv,
      async () => {
        fetchCount += 1;
        return turnstileSuccess();
      },
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Please complete your name, email, and message.');
    assert.equal(fetchCount, 0);
  });

  it('rejects honeypot submissions before Siteverify or email calls', async () => {
    let fetchCount = 0;
    const response = await handleContactRequest(
      makeFormRequest({
        ...validSubmission,
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

  it('rejects a missing Turnstile token', async () => {
    const { fetchImpl, calls } = fetchWithTurnstile(turnstileSuccess());
    const response = await handleContactRequest(
      makeFormRequest({ ...validSubmission, 'cf-turnstile-response': '' }),
      validEnv,
      fetchImpl,
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, 'Please complete the verification before sending your message.');
    assert.equal(calls.length, 0);
  });

  for (const [name, siteverifyResponse] of [
    ['invalid', Response.json({ success: false, 'error-codes': ['invalid-input-response'] })],
    ['expired or duplicate', Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] })],
    ['wrong action', turnstileSuccess({ action: 'booking' })],
    ['wrong hostname', turnstileSuccess({ hostname: 'attacker.example' })],
  ]) {
    it(`rejects a ${name} Turnstile token without sending email`, async () => {
      const { fetchImpl, calls } = fetchWithTurnstile(siteverifyResponse);
      const response = await handleContactRequest(
        makeFormRequest(validSubmission),
        validEnv,
        fetchImpl,
      );
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.error, 'Unable to verify your form submission. Please try again.');
      assert.equal(calls.length, 1);
      assert.match(calls[0].url, /turnstile\/v0\/siteverify$/);
    });
  }

  it('fails closed when Turnstile verification cannot complete', async () => {
    const { result: response, calls: logs } = await withCapturedConsoleError(() =>
      handleContactRequest(
        makeFormRequest(validSubmission),
        validEnv,
        async () => {
          throw new Error('network unavailable');
        },
      ),
    );
    const body = await response.json();

    assert.equal(response.status, 502);
    assert.equal(body.error, 'Unable to verify your form submission. Please try again.');
    assert.doesNotMatch(JSON.stringify(body), /turnstile-secret/);
    assert.doesNotMatch(JSON.stringify(logs), /turnstile-secret/);
  });

  for (const [name, fields] of [
    ['short name', { name: 'N' }],
    ['long name', { name: 'N'.repeat(81) }],
    ['oversized email', { email: `a@${'b'.repeat(251)}.com` }],
    ['short message', { message: 'Too short' }],
    ['oversized message', { message: 'M'.repeat(2001) }],
    ['unknown property', { property: 'unlisted-villa' }],
  ]) {
    it(`rejects ${name} before email delivery`, async () => {
      const { fetchImpl, calls } = fetchWithTurnstile(turnstileSuccess());
      const response = await handleContactRequest(
        makeFormRequest({ ...validSubmission, ...fields }),
        validEnv,
        fetchImpl,
      );

      assert.equal(response.status, 400);
      assert.equal(calls.length, 0);
    });
  }

  it('fails closed when the Turnstile secret is missing', async () => {
    const { fetchImpl, calls } = fetchWithTurnstile(turnstileSuccess());
    const response = await handleContactRequest(
      makeFormRequest(validSubmission),
      { ...validEnv, TURNSTILE_SECRET_KEY: '' },
      fetchImpl,
    );
    const body = await response.json();

    assert.equal(response.status, 500);
    assert.equal(body.error, 'Unable to send this message. Please try again.');
    assert.equal(calls.length, 0);
  });

  it('sends a valid submission through Siteverify and the Cloudflare Email Service REST API', async () => {
    const { fetchImpl, calls } = fetchWithTurnstile(turnstileSuccess());
    const response = await handleContactRequest(
      makeFormRequest(validSubmission, { 'CF-Connecting-IP': '203.0.113.12' }),
      validEnv,
      fetchImpl,
    );
    const body = await response.json();
    const siteverify = calls[0];
    const email = calls[1];
    const siteverifyFields = new URLSearchParams(siteverify.options.body);
    const sentMessage = JSON.parse(email.options.body);

    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
    assert.equal(calls.length, 2);
    assert.equal(siteverifyFields.get('secret'), 'turnstile-secret');
    assert.equal(siteverifyFields.get('response'), 'valid-turnstile-token');
    assert.equal(siteverifyFields.get('remoteip'), '203.0.113.12');
    assert.equal(
      email.url,
      'https://api.cloudflare.com/client/v4/accounts/account-id/email/sending/send',
    );
    assert.equal(email.options.method, 'POST');
    assert.equal(
      email.options.headers.authorization,
      'Bearer secret-token',
    );
    assert.equal(email.options.headers['content-type'], 'application/json');
    assert.equal(sentMessage.to, 'info@traditional-homes.gr');
    assert.deepEqual(sentMessage.from, {
      address: 'contact@traditional-homes.gr',
      name: 'Traditional Homes Contact Form',
    });
    assert.equal(sentMessage.reply_to, 'nikos@example.com');
    assert.match(sentMessage.subject, /almond-tree-villa/);
    assert.match(sentMessage.text, /Please send availability details\./);
  });

  it('does not expose secrets in failed email responses or logs', async () => {
    const { result: response, calls: logs } = await withCapturedConsoleError(() =>
      handleContactRequest(
        makeFormRequest(validSubmission),
        validEnv,
        async (url) =>
          url.includes('/turnstile/v0/siteverify')
            ? turnstileSuccess()
            : Response.json({ success: false, errors: [] }, { status: 403 }),
      ),
    );
    const body = await response.json();

    assert.equal(response.status, 502);
    assert.equal(body.error, 'Unable to send this message.');
    assert.doesNotMatch(JSON.stringify(body), /secret-token|turnstile-secret/);
    assert.doesNotMatch(JSON.stringify(logs), /secret-token|turnstile-secret/);
  });

  it('does not use an EMAIL send_email binding', async () => {
    const response = await handleContactRequest(
      makeFormRequest({
        ...validSubmission,
      }),
      {
        EMAIL: {
          send: async () => {
            throw new Error('EMAIL binding should not be used');
          },
        },
        ...validEnv,
      },
      async (url) =>
        url.includes('/turnstile/v0/siteverify') ? turnstileSuccess() : emailSuccess(),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true });
  });
});
