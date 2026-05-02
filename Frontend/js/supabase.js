import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jdofaujfqsyiwauwttcd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkb2ZhdWpmcXN5aXdhdXd0dGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDc3NTIsImV4cCI6MjA5MjYyMzc1Mn0.8THsIIRXq5xoTV7b9SeIed2tmug3ANz25Qoc0CMsWaY'

export const supabase = createClient(supabaseUrl, supabaseKey)