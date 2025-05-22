import {
  createDirectus,
  rest,
  authentication,
  readMe,
  login as directusLogin,
  logout as directusLogout,
  type DirectusClient,
  type AuthenticationData,
} from "@directus/sdk";

// Define a type for our Directus schema.
// You'll need to update this to reflect your Directus schema.
export type CreatorSchema = {
  global: {
    title: string;
    description: string;
  } & Record<string, any>; // Allow other built-in fields.
  directus_users: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    approved: boolean;
    role: string; // Assuming this is a string ID referencing directus_roles
    bio: string;
  } & Record<string, any>; // Allow other built-in fields.
  creators: {
    id: number;
    user_id: string; // ID of the related directus_users record (string, not number, in Directus SDK)
    specialization: string;
  } & Record<string, any>;
  works: {
    id: number;
    creator: number; // ID of the related creators record
    title: string;
    description: string;
    content_type: "image" | "text";
    content: string | null;
    image: { id: string; width: number; height: number } | null; // File object
    categories: number[]; // Array of category IDs
    published_date: string; // ISO Date string
    status: "draft" | "published" | "archived";
  } & Record<string, any>;
  categories: {
    id: number;
    name: string;
  } & Record<string, any>;
  directus_files: {
    id: string;
    storage: string;
    filename_disk: string;
    filename_download: string;
    title: string;
    type: string;
    folder: string | null;
    uploaded_by: string;
    uploaded_on: string;
    modified_by: string;
    modified_on: string;
    charset: string | null;
    filesize: number;
    width: number | null;
    height: number | null;
    duration: number | null;
    embed: string | null;
    description: string | null;
    location: string | null;
    tags: string[] | null;
    metadata: Record<string, any> | null;
  } & Record<string, any>;
};

const directus = createDirectus<CreatorSchema>(
  import.meta.env.PUBLIC_DIRECTUS_URL,
)
  .with(rest())
  .with(
    authentication("json", {
      autoRefresh: true,
      msRefreshBeforeExpires: 300000,
    }),
  );

// Authentication helper functions
export async function login(email: string, password: string) {
  try {
    const response = await directus.request(
      directusLogin(email, password, {
        // AuthenticationMode : 'cookie'
        mode: "json",
      }),
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    await directus.request(directusLogout());
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const user = await directus.request(
      readMe({
        fields: ["*"], // Specify the fields you want to retrieve
      }),
    );
    return user;
  } catch (error) {
    return null;
  }
}

export default directus;
