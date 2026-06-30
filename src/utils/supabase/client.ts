import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  try {
    new URL(supabaseUrl);
  } catch (e) {
    if (supabaseUrl && !supabaseUrl.startsWith('http')) {
      supabaseUrl = `https://${supabaseUrl}`;
      try {
        new URL(supabaseUrl);
      } catch (err) {
        supabaseUrl = 'https://placeholder.supabase.co';
      }
    } else {
      supabaseUrl = 'https://placeholder.supabase.co';
    }
  }

  if (!supabaseKey) {
    supabaseKey = 'placeholder';
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
// oi 