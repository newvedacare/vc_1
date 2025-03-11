import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

const supabaseUrl = 'https://jgjktuuwwdvfoxccyqqi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnamt0dXV3d2R2Zm94Y2N5cXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NDM4MDYsImV4cCI6MjA1NzAxOTgwNn0.1B7djDXTFPYF1h9M8eBEsyQX4A5uZUDqSG1WeOvOmgM'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)