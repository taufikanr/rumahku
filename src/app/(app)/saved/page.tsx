import { getCurrentProfile } from "@/lib/auth";
import { getDemoTenant, getListings } from "@/lib/data";
import { SavedListings } from "@/components/listing/saved-listings";

export const metadata = { title: "Saved homes" };

export default async function SavedPage() {
  const profile = await getCurrentProfile();
  const habits = profile?.habits ?? getDemoTenant().habits;
  const listings = await getListings({ userHabits: habits });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        Saved homes
      </h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Your shortlisted rooms and homes, saved on this device.
      </p>
      <SavedListings listings={listings} />
    </div>
  );
}
