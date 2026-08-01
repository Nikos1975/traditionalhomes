const REQUIRED_FIELD_ERROR = 'Please complete your name, email, and message.';
const CLOUDFLARE_EMAIL_API_BASE =
  'https://api.cloudflare.com/client/v4/accounts';
const TURNSTILE_SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ALLOWED_TURNSTILE_HOSTNAMES = new Set([
  'traditional-homes.gr',
  'www.traditional-homes.gr',
]);
const ALLOWED_PROPERTIES = new Set([
  '',
  'argyro',
  'leonidas',
  'margarita',
  'dimitra',
  'penelope',
  'erato',
  'clio',
  'efterpi',
  'kalliopi',
  'monastiri',
  'almond-tree-villa',
  'multiple',
]);

const jsonResponse = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  });

const getField = (formData, name) => {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidSubmission = ({ name, email, property, message }) =>
  name.length >= 2 &&
  name.length <= 80 &&
  email.length <= 254 &&
  isValidEmail(email) &&
  message.length >= 15 &&
  message.length <= 2000 &&
  ALLOWED_PROPERTIES.has(property);

const getTurnstileSecret = (env) => env?.TURNSTILE_SECRET_KEY?.trim();

const verifyTurnstile = async ({ token, secret, remoteIp }, fetchImpl) => {
  const body = new URLSearchParams({ secret, response: token });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  try {
    const response = await fetchImpl(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      return { verified: false, unavailable: false };
    }

    return {
      verified:
        result.action === 'contact' &&
        ALLOWED_TURNSTILE_HOSTNAMES.has(result.hostname),
      unavailable: false,
    };
  } catch {
    return { verified: false, unavailable: true };
  }
};

const stripHeaderValue = (value) => value.replace(/[\r\n]+/g, ' ').trim();

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildEmail = ({ name, email, property, message }, { fromEmail, toEmail }) => {
  const safeName = stripHeaderValue(name);
  const safeEmail = stripHeaderValue(email);
  const propertyLine = property || 'General enquiry';
  const subjectProperty = property ? ` - ${stripHeaderValue(property)}` : '';
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Property: ${propertyLine}`,
    '',
    'Message:',
    message,
  ].join('\n');
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Property:</strong> ${escapeHtml(propertyLine)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  return {
    to: toEmail,
    from: {
      address: fromEmail,
      name: 'Traditional Homes Contact Form',
    },
    reply_to: safeEmail,
    subject: `Website contact form${subjectProperty} from ${safeName}`,
    text,
    html,
  };
};

const getEmailConfig = (env) => {
  const toEmail = env?.CONTACT_EMAIL_TO?.trim();
  const fromEmail = env?.CONTACT_EMAIL_FROM?.trim();
  const accountId = env?.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = env?.CLOUDFLARE_EMAIL_API_TOKEN?.trim();

  if (
    !toEmail ||
    !fromEmail ||
    !accountId ||
    !apiToken ||
    !isValidEmail(toEmail) ||
    !isValidEmail(fromEmail)
  ) {
    return null;
  }

  return { toEmail, fromEmail, accountId, apiToken };
};

const sendContactEmail = async (submission, config, fetchImpl) => {
  const url = `${CLOUDFLARE_EMAIL_API_BASE}/${encodeURIComponent(
    config.accountId,
  )}/email/sending/send`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.apiToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(buildEmail(submission, config)),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    const firstError = Array.isArray(result?.errors)
      ? result.errors[0]
      : undefined;
    console.error('Contact email REST send failed', {
      status: response.status,
      code: firstError?.code,
      message: firstError?.message,
    });
    throw new Error('Cloudflare Email Service REST send failed');
  }
};

export async function handleContactRequest(request, env, fetchImpl = fetch) {
  if (request.method !== 'POST') {
    return jsonResponse(
      { error: 'Method not allowed.' },
      405,
      { allow: 'POST' },
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: 'Invalid form submission.' }, 400);
  }

  const honeypot = getField(formData, 'website');
  if (honeypot) {
    return jsonResponse({ error: 'Unable to send this message.' }, 400);
  }

  const submission = {
    name: getField(formData, 'name'),
    email: getField(formData, 'email'),
    property: getField(formData, 'property'),
    message: getField(formData, 'message'),
  };

  if (!submission.name || !submission.email || !submission.message) {
    return jsonResponse({ error: REQUIRED_FIELD_ERROR }, 400);
  }

  if (!isValidSubmission(submission)) {
    return jsonResponse({ error: 'Please check the details in your message.' }, 400);
  }

  const turnstileToken = getField(formData, 'cf-turnstile-response');
  if (!turnstileToken) {
    return jsonResponse(
      { error: 'Please complete the verification before sending your message.' },
      400,
    );
  }

  const turnstileSecret = getTurnstileSecret(env);
  if (!turnstileSecret) {
    return jsonResponse(
      { error: 'Unable to send this message. Please try again.' },
      500,
    );
  }

  const turnstile = await verifyTurnstile(
    {
      token: turnstileToken,
      secret: turnstileSecret,
      remoteIp: request.headers.get('CF-Connecting-IP')?.trim(),
    },
    fetchImpl,
  );

  if (!turnstile.verified) {
    return jsonResponse(
      { error: 'Unable to verify your form submission. Please try again.' },
      turnstile.unavailable ? 502 : 400,
    );
  }

  const config = getEmailConfig(env);
  if (!config) {
    return jsonResponse({ error: 'Email service is not configured.' }, 500);
  }

  try {
    await sendContactEmail(submission, config, fetchImpl);
  } catch (error) {
    if (error?.message !== 'Cloudflare Email Service REST send failed') {
      console.error('Contact email REST request failed', {
        message: error?.message,
      });
    }
    return jsonResponse({ error: 'Unable to send this message.' }, 502);
  }

  return jsonResponse({ ok: true });
}

export async function onRequest({ request, env }) {
  return handleContactRequest(request, env);
}
