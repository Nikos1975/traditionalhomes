import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import { resolve, sep } from 'node:path';
import { check } from 'linkinator';

const distRoot = resolve('dist');

if (!existsSync(distRoot)) {
  throw new Error('dist is missing. Run npm run build before npm run seo:links.');
}

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const target = resolve(distRoot, `.${pathname}`);

  if (target !== distRoot && !target.startsWith(`${distRoot}${sep}`)) {
    response.writeHead(403).end();
    return;
  }

  const file = pathname.endsWith('/') ? resolve(target, 'index.html') : target;

  try {
    const metadata = await stat(file);
    if (!metadata.isFile()) throw new Error('Not a file');

    response.writeHead(200, { 'content-length': metadata.size });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolveServer) => server.listen(0, '127.0.0.1', resolveServer));

try {
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not start generated-site server.');

  const localOrigin = `http://127.0.0.1:${address.port}`;
  const result = await check({
    path: localOrigin,
    recurse: true,
    cleanUrls: true,
    checkFragments: true,
    requireHttps: 'error',
    redirects: 'warn',
    statusCodes: { '4xx': 'error', '5xx': 'error' },
    linksToSkip: [
      'traditionalhomes\\.reserve-online\\.net',
      '^https://www\\.iwm\\.org\\.uk/history/what-was-the-battle-of-crete/?$',
      '^https://www\\.hospitalitynet\\.org/announcement/41014450/innside-by-melia-elounda-brings-a-new-era-of-hospitality-to-crete-officially-open-innsides-first-5-star-resort-in-the-world/?$',
    ],
    urlRewriteExpressions: [{ pattern: /^https:\/\/traditional-homes\.gr/, replacement: localOrigin }],
    staticHttpServerHost: localOrigin,
  });

  if (!result.passed) {
    const broken = result.links.filter((link) => link.state === 'BROKEN');
    for (const link of broken) console.error(`[${link.status ?? 0}] ${link.url}`);
    process.exitCode = 1;
  }
} finally {
  await new Promise((resolveServer, rejectServer) =>
    server.close((error) => (error ? rejectServer(error) : resolveServer())),
  );
}
