import type { SupabaseClient } from "@supabase/supabase-js";

const TOKEN_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TOKEN_LENGTH = 6;
const MAX_TOKEN_GENERATION_ATTEMPTS = 25;

export function generateToken(length = TOKEN_LENGTH) {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Token length must be a positive integer.");
  }

  const bytes = crypto.getRandomValues(new Uint32Array(length));
  let token = "";

  for (let index = 0; index < length; index += 1) {
    token += TOKEN_CHARACTERS[bytes[index] % TOKEN_CHARACTERS.length];
  }

  return token;
}

async function isTokenAvailable(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase.from("forms").select("id").eq("qr_share_token", token).maybeSingle();

  if (error) {
    throw error;
  }

  return data === null;
}

export async function generateUniqueToken(supabase: SupabaseClient, length = TOKEN_LENGTH) {
  for (let attempt = 0; attempt < MAX_TOKEN_GENERATION_ATTEMPTS; attempt += 1) {
    const token = generateToken(length);

    if (await isTokenAvailable(supabase, token)) {
      return token;
    }
  }

  throw new Error("Unable to generate a unique share token.");
}

export const generateShortToken = generateToken;
export const generateUniqueShortToken = generateUniqueToken;
