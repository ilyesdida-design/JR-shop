const SUPABASE_URL = "https://cstjgsuehmqcolajspqh.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_e_wQxqCrx21Qq1kRYKjFMg_yR6TQfKX";

if (
  typeof supabase === "undefined" ||
  typeof supabase.createClient !== "function"
) {
  console.error("Supabase library is not loaded correctly.");
} else {

  const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

}
