"use client";

import React, { useState } from "react";

import type { Profile } from "@/db/schema";
import {
  Check,
  Info,
  Loader2,
  Lock,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileDetailsFormProps {
  initialProfile: Profile | null;
  userEmail?: string | null;
  userPhone?: string | null;
}

function formatContactDisplay(contact?: string | null) {
  if (!contact) return "";
  const clean = contact.replace(/\D/g, "");
  if (clean.length === 10) return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  if (clean.length === 12 && clean.startsWith("91")) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return contact;
}

export function ProfileDetailsForm({
  initialProfile,
  userEmail,
  userPhone,
}: ProfileDetailsFormProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [firstName, setFirstName] = useState(initialProfile?.firstName || "");
  const [lastName, setLastName] = useState(initialProfile?.lastName || "");
  const [email, setEmail] = useState(initialProfile?.email || userEmail || "");
  const [phone, setPhone] = useState(
    initialProfile?.phone?.replace(/^\+91/, "") ||
      userPhone?.replace(/^\+91/, "") ||
      ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // If user signed in via email magic link, email is their login credential
  const isEmailAuth = Boolean(userEmail);
  const primaryContact = profile?.email || email || profile?.phone || userPhone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone && cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: Record<string, unknown> = {
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        phone: cleanPhone ? cleanPhone : null,
      };

      if (!isEmailAuth) {
        payload.email = email.trim() ? email.trim().toLowerCase() : null;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data.profile);
      setSavedSuccess(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Account Highlights Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 font-serif text-lg font-bold text-rose-600">
            {firstName ? (
              firstName[0]?.toUpperCase()
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">
              {firstName || lastName
                ? `${firstName} ${lastName}`.trim()
                : "Valued Customer"}
            </h3>
            {primaryContact && (
              <p className="text-xs text-neutral-500">
                {formatContactDisplay(primaryContact)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile && profile.loyaltyPoints > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>{profile.loyaltyPoints} Points</span>
            </div>
          )}
          {memberSince && (
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-600">
              <Shield className="h-3.5 w-3.5 text-neutral-400" />
              <span>Member since {memberSince}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold text-neutral-900">
            Personal Information
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Update your personal details for a personalized shopping experience.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {savedSuccess && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Your personal details have been saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs font-semibold tracking-wider text-neutral-700 uppercase"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-xs font-semibold tracking-wider text-neutral-700 uppercase"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="flex items-center justify-between text-xs font-semibold tracking-wider text-neutral-700 uppercase"
              >
                <span>Email Address</span>
                {isEmailAuth ? (
                  <span className="flex items-center gap-1 text-[11px] font-normal text-neutral-400">
                    <Lock className="h-3 w-3" /> Managed via login
                  </span>
                ) : (
                  <span className="text-[11px] font-normal text-neutral-400">
                    For invoices & order updates
                  </span>
                )}
              </label>
              <div className="relative mt-1.5">
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled={isEmailAuth}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm ${
                    isEmailAuth
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-100/70 font-medium text-neutral-500"
                      : "border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold tracking-wider text-neutral-700 uppercase"
              >
                Contact Phone Number
              </label>
              <div className="relative mt-1.5">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-bold text-neutral-500">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-neutral-300 py-2.5 pr-3.5 pl-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Info className="h-3.5 w-3.5 text-neutral-400" />
              <span>We never share your personal information.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? "Saving..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
