const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

const money = (n) =>
new Intl.NumberFormat("fr-DZ").format(Number(n || 0)) + " DA";
