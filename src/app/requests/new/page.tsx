import { redirect } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { ToolRequestForm } from "@/components/tool-request-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function NewToolRequestPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Request Posts Need Supabase Setup" />
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/requests/new");
  }

  const { data: profile } = await supabase.from("profiles").select("neighborhood").eq("id", user.id).maybeSingle();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ToolRequestForm initialNeighborhood={profile?.neighborhood ?? ""} userId={user.id} />
    </div>
  );
}
