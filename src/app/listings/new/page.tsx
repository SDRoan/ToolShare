import { redirect } from "next/navigation";

import { ListingForm } from "@/components/listing-form";
import { SetupNotice } from "@/components/setup-notice";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function NewListingPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Creating Listings Needs Supabase Setup" />
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/listings/new");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ListingForm mode="create" userId={user.id} />
    </div>
  );
}
