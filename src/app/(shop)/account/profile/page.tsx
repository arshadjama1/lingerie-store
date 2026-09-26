import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { getUserAddresses } from "@/modules/addresses";
import { getProfile } from "@/modules/auth";

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
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back navigation */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Account
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-sm font-medium text-neutral-900">
            Profile & Addresses
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8 border-b border-neutral-200/80 pb-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Profile & Addresses
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your personal profile details and saved delivery addresses.
          </p>
        </div>

        {/* Profile Details Section */}
        <div className="space-y-10">
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
      </div>
    </div>
  );
}
