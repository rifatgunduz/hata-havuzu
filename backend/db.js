const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client yapılandırması
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY environment değişkenleri gerekli!');
  process.exit(-1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Bağlantı testi
(async () => {
  try {
    const { data, error } = await supabase.from('ogrenciler').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') { // PGRST116 = tablo boş
      throw error;
    }
    console.log('✓ Supabase veritabanına bağlantı başarılı');
  } catch (err) {
    console.error('❌ Supabase bağlantı hatası:', err.message);
    console.log('💡 Lütfen SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY değerlerini kontrol edin');
  }
})();

module.exports = supabase;
