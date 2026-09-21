"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AdminShipFormProps {
  orderId: string;
  currentAwb: string | null;
}

export function AdminShipForm({ orderId, currentAwb }: AdminShipFormProps) {
  const router = useRouter();

  // Section 1 — manual AWB
  const [awb, setAwb] = useState(currentAwb ?? "");
  const [markShipped, setMarkShipped] = useState(false);
  const [awbLoading, setAwbLoading] = useState(false);

  // Section 2 — DTDC API stub
  const [dtdcLoading, setDtdcLoading] = useState(false);
  const [dtdcError, setDtdcError] = useState<string | null>(null);

  async function handleSaveAwb(e: React.FormEvent) {
    e.preventDefault();
    if (!awb.trim()) {
      toast.error("AWB number is required");
      return;
    }
    setAwbLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/awb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awbNumber: awb.trim(),
          markAsShipped: markShipped,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save AWB");
        return;
      }
      toast.success(
        markShipped
          ? "AWB saved and order marked as shipped"
          : "AWB number saved"
      );
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setAwbLoading(false);
    }
  }

  async function handleDtdcShip() {
    setDtdcLoading(true);
    setDtdcError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setDtdcError(data.error ?? "DTDC API error");
        return;
      }
      toast.success(`Shipment created. AWB: ${data.awbNumber}`);
      router.refresh();
    } catch {
      setDtdcError("Network error — please try again");
    } finally {
      setDtdcLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1 — Manual AWB */}
      <form onSubmit={handleSaveAwb} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
            AWB Number
          </label>
          <input
            type="text"
            value={awb}
            onChange={(e) => setAwb(e.target.value)}
            placeholder="Enter DTDC AWB number…"
            className="w-full rounded-none border border-gray-200 px-3 py-2 font-mono text-sm focus:border-[#3d0a20] focus:outline-none"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={markShipped}
            onChange={(e) => setMarkShipped(e.target.checked)}
            className="accent-[#3d0a20]"
          />
          Mark order as Shipped
        </label>

        <button
          type="submit"
          disabled={awbLoading}
          className="w-full rounded-none border border-[#3d0a20] px-4 py-2 text-sm font-semibold text-[#3d0a20] transition-colors hover:bg-[#3d0a20] hover:text-white disabled:opacity-50"
        >
          {awbLoading ? "Saving…" : "Save AWB Number"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-400">or</span>
        </div>
      </div>

      {/* Section 2 — DTDC API (stubbed) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleDtdcShip}
          disabled={dtdcLoading}
          title="DTDC API keys not yet configured"
          className="group relative w-full rounded-none border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
        >
          {dtdcLoading
            ? "Creating shipment…"
            : "Create Shipment via DTDC API ⚠"}
          <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
            DTDC API keys not yet configured
          </span>
        </button>

        {dtdcError && (
          <div className="flex items-start gap-2 rounded-none border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-700">{dtdcError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
