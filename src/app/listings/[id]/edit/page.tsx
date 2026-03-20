import { notFound } from "next/navigation";

import { ListingForm } from "@/components/listing-form";
import { SetupNotice } from "@/components/setup-notice";
import { getEditableListing } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type EditListingPageProps = {
  params: {
    id: string;
  };
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <SetupNotice title="Editing Listings Needs Supabase Setup" />
      </div>
    );
  }

  const { user, listing } = await getEditableListing(params.id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ListingForm
        initialValues={{
          title: listing.title,
          description: listing.description,
          category: listing.category,
          neighborhood: listing.neighborhood,
          isAvailable: listing.is_available,
          photoUrl: listing.photo_url
        }}
        listingId={listing.id}
        mode="edit"
        userId={user.id}
      />
    </div>
  );
}
