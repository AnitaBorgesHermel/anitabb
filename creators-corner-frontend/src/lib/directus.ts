// src/lib/directus.ts
import {
  createDirectus,
  rest,
  authentication,
  readMe,
  login as directusLogin,
  logout as directusLogout,
  type DirectusClient,
  type RestClient,
  type AuthenticationClient,
  type AuthenticationData,
  type AuthenticationStorage,
} from "@directus/sdk";

// Environment variable validation
const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL;
if (!DIRECTUS_URL) {
  console.error("PUBLIC_DIRECTUS_URL environment variable is not set");
}

// Enhanced schema definition with stricter types
export type CreatorSchema = {
  // ... (keep your existing schema definition)
};

type AuthResponse = {
  access_token: string;
  expires: number;
  refresh_token?: string;
};

// Custom storage to handle tokens properly
const authStorage: AuthenticationStorage = {
  get: async () => {
    const data = localStorage.getItem('directus_auth');
    return data ? JSON.parse(data) : null;
  },
  set: async (value: AuthenticationData | null) => {
    if (value) {
      localStorage.setItem('directus_auth', JSON.stringify(value));
    } else {
      localStorage.removeItem('directus_auth');
    }
  },
};

// Create the Directus client with proper typing and storage
type CreatorClient = DirectusClient<CreatorSchema> & 
  RestClient<CreatorSchema> & 
  AuthenticationClient<CreatorSchema>;

const directus: CreatorClient = createDirectus<CreatorSchema>(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json', {
    storage: authStorage,
    autoRefresh: true,
    msRefreshBeforeExpires: 300000, // 5 minutes before token expires
  }));

// Enhanced login function with proper token handling
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await directus.request<AuthResponse>(
      directusLogin(email, password, { mode: 'json' })
    );

    if (!response.access_token || !response.expires) {
      throw new Error('Invalid authentication response');
    }

    // Store the tokens in our custom storage
    await authStorage.set({
      access_token: response.access_token,
      expires: response.expires,
      refresh_token: response.refresh_token,
    });

    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Login failed. Please check your credentials.'
    );
  }
}

// Enhanced logout function
export async function logout(): Promise<void> {
  try {
    await authStorage.set(null);
    await directus.request(directusLogout());
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error('Failed to logout. Please try again.');
  }
}

// Get current authentication state
export function getAuthState(): AuthResponse | null {
  const data = localStorage.getItem('directus_auth');
  return data ? JSON.parse(data) : null;
}

// Enhanced current user function
export async function getCurrentUser() {
  try {
    const authState = getAuthState();
    if (!authState?.access_token) return null;

    const user = await directus.request(
      readMe({
        fields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'avatar',
          'role'
        ],
      })
    );
    return user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

// Utility to check if token is expired
export function isTokenExpired(): boolean {
  const authState = getAuthState();
  if (!authState) return true;
  return Date.now() >= authState.expires;
}

export default directus;