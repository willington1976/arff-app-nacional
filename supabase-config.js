// URL corregida según tu panel de Supabase
const SUPABASE_URL = 'https://mctrdchacgwtqimsdpvn.supabase.co';

// La KEY se mantiene igual (asegúrate de que no tenga espacios)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdHJkY2hhY2d3dHFpbXNkcHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjY4MDYsImV4cCI6MjA4ODU0MjgwNn0.RypOxjmrjrGXMM2ujRAwxanAkOKLzH4qZEKE4IQTFsQ'; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
