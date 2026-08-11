```javascript
/* =========================================================
   JR SHOP - SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://cstjgsuehmqcolajspqh.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_e_wQxqCrx21Qq1kRYKjFMg_yR6TQfKX";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
```
