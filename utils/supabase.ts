import { createClient } from '@supabase/supabase-js';

// Энэ 2 утгыг Supabase-ийн Project Settings -> API хэсгээс авч солино
const supabaseUrl = 'https://wsrqxokgcsftkiyfltxs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcnF4b2tnY3NmdGtpeWZsdHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNTk1NzEsImV4cCI6MjEwNDkzNTU3MX0.ALsOvlesexT2Gxx8YWdChn92qcl3E28JyGOY-5QkOs4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);