import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ugzgizjayprtpqkuapzz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XP1Uw-SKdcL8dDYRyjU8VQ_QWavOQRh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);