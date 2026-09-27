"use client";

import React, { useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?: "button" | "card" | "menu-item" | "ghost";
  showIcon?: boolean;
  label?: string;
  confirm?: boolean;
  onSuccess?: () => void;
}

export function LogoutButton({
  className,
  variant = "button",
  showIcon = true,
  label = "Sign Out",
  confirm = true,
  onSuccess,
}: LogoutButtonProps) {
  const { openSignOutModal, signOut } = useAuthStore();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm) {
      if (onSuccess) onSuccess();
      openSignOutModal();
      return;
    }

    try {
      setIsPending(true);
      await signOut();
      if (onSuccess) onSuccess();
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "group flex w-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-xs transition-all hover:border-rose-200 hover:bg-rose-50/20 hover:shadow-md disabled:opacity-50",
          className
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-rose-100 group-hover:text-rose-600">
          <LogOut className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 group-hover:text-rose-700">
            {isPending ? "Signing Out..." : label}
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Sign out of your Surekh account
          </p>
        </div>
      </button>
    );
  }

  if (variant === "menu-item") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50",
          className
        )}
      >
        {showIcon && (
          <LogOut className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-rose-600" />
        )}
        <span>{isPending ? "Signing out..." : label}</span>
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-500 transition-colors hover:text-rose-700 disabled:opacity-50",
          className
        )}
      >
        {showIcon && <LogOut className="h-3.5 w-3.5" />}
        <span>{isPending ? "Signing out..." : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-xs transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50",
        className
      )}
    >
      {showIcon && <LogOut className="h-4 w-4 text-neutral-500" />}
      <span>{isPending ? "Signing out..." : label}</span>
    </button>
  );
}
