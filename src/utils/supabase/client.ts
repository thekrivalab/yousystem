import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  console.log("SUPABASE_URL =", supabaseUrl);
  console.log("SUPABASE_KEY EXISTS =", !!supabaseKey);

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
  }

  if (!supabaseKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};