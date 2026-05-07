import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nrtjizkeopxhpmjxxnjk.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydGppemtlb3B4aHBtanh4bmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI0OTAsImV4cCI6MjA5Mzc0ODQ5MH0.AoVh2vB9TQAleI4QjO5ikQtbdUzrWs1A4BxDoZNeGQM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
