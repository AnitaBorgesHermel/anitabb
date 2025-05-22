export const prerender = false;

import { login } from "../../../lib/directus";
import { jwtDecode } from "jwt-decode";

type LoginParams = {
  email: string;
  password: string;
};

export async function POST({ request }: { request: Request }) {
  try {
    // Retrieve the email and password from the request JSON body
    const { email, password } = (await request.json()) as LoginParams;
    // Attempt to log in the user using Directus
    const { expires, refresh_token, access_token } = await login(
      email,
      password,
    );
    // Retrieve the token and user information (adjust according to your needs)
    const userId = access_token ? jwtDecode(access_token) : null;

    // Prepare proper cookie options. In Astro (and many Node frameworks)
    // you can set multiple cookies by using multiple Set-Cookie headers.
    // Here we create cookies for both the token and the refresh token.
    // const cookieOptions = "HttpOnly; Secure; SameSite=Strict; Path=/";
    // const tokenCookie = `token=${access_token}; ${cookieOptions}`;
    // const refreshCookie = `refreshToken=${refresh_token}; ${cookieOptions}`;
    // const userIdCookie = `userId=${JSON.stringify(userId)}; ${cookieOptions}`;

    // In a real app you might also write to a session store so that
    // the userId (or other user info)
    // is available to your other endpoints (like /api/me.json).

    return new Response(
      JSON.stringify({ expires, access_token, refresh_token, userId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        message: "Authentication failed",
        error: error.message,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
}
