import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hzkhpypxxvlijibyxayv.supabase.co";
const supabaseKey = "sb_publishable_jVCFtQCngVzUOk8QNzivhg_refH_mDj";

export const supabase = createClient(supabaseUrl, supabaseKey);