import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { getUserAddresses } from "@/modules/addresses";
import { getProfile } from "@/modules/auth";

import { AccountShell } from "@/components/account/AccountShell";
import { AddressManager } from "@/components/account/AddressManager";
import { ProfileDetailsForm } from "@/components/account/ProfileDetailsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile & Addresses | My Account | Surekh",
  description: "Manage your personal information and delivery addresses.",
};

export default async function AccountProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/profile");
  }

  const [profile, addresses] = await Promise.all([
    getProfile(user.id),
    getUserAddresses(user.id),
  ]);

  return (
    <AccountShell
      title="Profile & Delivery Addresses"
      subtitle="Manage your personal details, contact info, and saved shipping destinations."
    >
      <div className="space-y-10">
        {/* Personal Details Form */}
        <ProfileDetailsForm
          initialProfile={profile}
          userEmail={user.email}
          userPhone={user.phone}
        />

        {/* Delivery Addresses Section */}
        <div className="border-t border-neutral-200/80 pt-8">
          <AddressManager initialAddresses={addresses} />
        </div>
      </div>
    </AccountShell>
  );
}
