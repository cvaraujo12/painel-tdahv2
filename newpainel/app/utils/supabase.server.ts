import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://emrttphdkludlvnysqnh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcnR0cGhka2x1ZGx2bnlzcW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNDA1NzEsImV4cCI6MjA1MzYxNjU3MX0.UCP0zLddVqOTyEwxhZtJPuFdCq_MB2ATgG-kYWsNJMA'

export const supabase = createClient(supabaseUrl, supabaseKey) 