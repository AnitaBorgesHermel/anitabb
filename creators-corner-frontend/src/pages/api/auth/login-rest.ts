import type { APIRoute } from "astro";
//import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../../lib/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  console.log("email", email);
  console.log("password", password)
  try {
    // Call your Directus API
    const response = await fetch("http://localhost:8055/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }
    console.log("response: ", response);
    const authData = await response.json();
    console.log("authData: ", authData);
    console.log("Is Prod?: ", import.meta.env.PROD)
    // Set HTTP-only cookies for security
    // cookies.set(AUTH_COOKIE_NAME, authData.access_token, {
    //   path: "/",
    //   httpOnly: true,
    //   secure: import.meta.env.PROD, // Secure in production
    //   maxAge: Math.floor(authData.expires / 1000), // Convert ms to seconds
    //   sameSite: "strict",
    // });

    // cookies.set(REFRESH_COOKIE_NAME, authData.refresh_token, {
    //   path: "/",
    //   httpOnly: true,
    //   secure: import.meta.env.PROD,
    //   maxAge: 60 * 60 * 24 * 7, // 7 days
    //   sameSite: "strict",
    // });

    // Return user info (but not the tokens, as they're in HTTP-only cookies)
    return new Response(JSON.stringify({message:"ok"}), {
      status: 200,
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 500,
    });
  }
};
