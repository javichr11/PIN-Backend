// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Aquí colocas tu URL y clave pública de Supabase
const supabaseUrl = 'https://chuzjrzthjfucwgkxroj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodXpqcnp0aGpmdWN3Z2t4cm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcwODc2OTUsImV4cCI6MjA0MjY2MzY5NX0.4JPQ_xIVCdn3fBj_k1LFJG5vbdbBTue_dYvm2bfsaes';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
