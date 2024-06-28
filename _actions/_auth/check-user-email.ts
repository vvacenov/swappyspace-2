import { createServiceClient } from "@/utils/supabase/service-server";

export async function checkEmail(email: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("check_email_exists", {
    user_email: email,
  });
  if (error) {
    const err = { error: error.message };
    return err;
  }
  return data;
}
