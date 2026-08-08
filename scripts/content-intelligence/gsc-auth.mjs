const WEBMASTERS_READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const blocked = () => new Error("Authentication blocked: local user Application Default Credentials are required.");

async function defaultCreateAuthClient({ scopes }) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) throw blocked();
  const { GoogleAuth, UserRefreshClient } = await import("google-auth-library");
  const client = await new GoogleAuth({ scopes }).getClient();
  if (!(client instanceof UserRefreshClient)) throw blocked();
  return client;
}

export class LocalUserAdcAuthProvider {
  constructor({ createAuthClient = defaultCreateAuthClient } = {}) {
    this.createAuthClient = createAuthClient;
  }

  async getAccessToken() {
    try {
      const client = await this.createAuthClient({ scopes: [WEBMASTERS_READONLY_SCOPE] });
      if (client.credentials?.type && client.credentials.type !== "authorized_user") throw blocked();
      const accessToken = await client.getAccessToken();
      const token = typeof accessToken === "string" ? accessToken : accessToken?.token;
      if (!token) throw blocked();
      return token;
    } catch (error) {
      if (error?.message?.startsWith("Authentication blocked:")) throw error;
      throw blocked();
    }
  }

  async getRequestHeaders() {
    try {
      const client = await this.createAuthClient({ scopes: [WEBMASTERS_READONLY_SCOPE] });
      if (client.credentials?.type && client.credentials.type !== "authorized_user") throw blocked();
      const headers = await client.getRequestHeaders();
      if (!headers?.Authorization) throw blocked();
      return headers;
    } catch (error) {
      if (error?.message?.startsWith("Authentication blocked:")) throw error;
      throw blocked();
    }
  }
}

export { WEBMASTERS_READONLY_SCOPE };
