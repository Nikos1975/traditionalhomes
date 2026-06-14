const CONTACT_RECIPIENT = 'eloundavilla@gmail.com';
const REQUIRED_FIELD_ERROR = 'Please complete your name, email, and message.';

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

const stripHeaderValue = (value) => value.replace(/[\r\n]+/g, ' ').trim();

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildEmail = ({ name, email, property, message }, fromEmail) => {
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
    to: CONTACT_RECIPIENT,
    from: {
      email: fromEmail,
      name: 'Traditional Homes Contact Form',
    },
    replyTo: safeEmail,
    subject: `Website contact form${subjectProperty} from ${safeName}`,
    text,
    html,
  };
};

export async function handleContactRequest(request, env) {
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

  if (!isValidEmail(submission.email)) {
    return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
  }

  if (!env?.EMAIL || typeof env.EMAIL.send !== 'function') {
    return jsonResponse({ error: 'Email service is not configured.' }, 500);
  }

  const fromEmail = env.CONTACT_EMAIL_FROM?.trim();
  if (!fromEmail || !isValidEmail(fromEmail)) {
    return jsonResponse({ error: 'Email sender is not configured.' }, 500);
  }

  try {
    await env.EMAIL.send(buildEmail(submission, fromEmail));
  } catch (error) {
    console.error('Contact email send failed', {
      code: error?.code,
      message: error?.message,
    });
    return jsonResponse({ error: 'Unable to send this message.' }, 502);
  }

  return jsonResponse({ ok: true });
}

export async function onRequest({ request, env }) {
  return handleContactRequest(request, env);
}
