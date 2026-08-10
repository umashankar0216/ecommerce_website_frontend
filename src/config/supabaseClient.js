import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jegvanfasbgqtxpgxfel.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zrhmYTfeM8BeD1ixMUR3nA_GRbYnbnh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * @param {File} file - The file object to upload
 * @param {string} bucket - The name of the storage bucket
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImageToSupabase(file, bucket = 'product-images') {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Generate unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  // Upload file to bucket
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload error: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Failed to retrieve public URL from Supabase Storage.');
  }

  return publicUrlData.publicUrl;
}
