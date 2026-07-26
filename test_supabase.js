const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qzmmpprdyvhaleixzlma.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bW1wcHJkeXZoYWxlaXh6bG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDg2NDUsImV4cCI6MjA5OTI4NDY0NX0.utC_f7b0IfSMA5fKTeNDKVK0TL3paGKfp-WN3q-3keI');

async function test() {
  const { data, error } = await supabase.storage.from('cheotnun-images').upload('test.txt', 'hello world');
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
