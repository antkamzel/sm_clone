import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://ocwhymoutgwkicordbjq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2h5bW91dGd3a2ljb3JkYmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkxMzA3NzUsImV4cCI6MjAyNDcwNjc3NX0.RbgJKLqYonH646KDMpHp41P_vUxu8GGP94DZruBQsv4')