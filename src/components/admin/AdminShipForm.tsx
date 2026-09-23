"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Printer,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

interface AdminShipFormProps {
  orderId: string;
  currentAwb: string | null;
}

export function AdminShipForm({ orderId, currentAwb }: AdminShipFormProps) {
  const router = useRouter();

  // Booking states
  const [dtdcLoading, setDtdcLoading] = useState(false);
  const [dtdcError, setDtdcError] = useState<string | null>(null);

  // Package dimensions & weight for DTDC softdata upload
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [weightKg, setWeightKg] = useState("0.35");
  const [lengthCm, setLengthCm] = useState("20");
  const [widthCm, setWidthCm] = useState("15");
  const [heightCm, setHeightCm] = useState("5");

  // Section 2 — manual AWB
  const [showManualAwb, setShowManualAwb] = useState(!currentAwb);
  const [awb, setAwb] = useState(currentAwb ?? "");
  const [markShipped, setMarkShipped] = useState(true);
  const [awbLoading, setAwbLoading] = useState(false);

  async function handleDtdcShip() {
    setDtdcLoading(true);
    setDtdcError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: parseFloat(weightKg) || 0.35,
          length: parseFloat(lengthCm) || 20,
          width: parseFloat(widthCm) || 15,
          height: parseFloat(heightCm) || 5,
          markAsShipped: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDtdcError(data.error ?? "DTDC booking failed");
        toast.error(data.error ?? "DTDC booking failed");
        return;
      }

      toast.success(`DTDC Consignment created! AWB: ${data.awbNumber}`);
      router.refresh();

      // Open shipping label in new tab if available
      if (data.labelUrl) {
        window.open(data.labelUrl, "_blank");
      }
    } catch {
      const errText = "Network error while connecting to DTDC API";
      setDtdcError(errText);
      toast.error(errText);
    } finally {
      setDtdcLoading(false);
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Existing AWB / Quick Actions */}
      {currentAwb ? (
        <div className="space-y-3 rounded-none border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
              DTDC Consignment Active
            </span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-900">
              {currentAwb}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={`/api/admin/orders/${orderId}/label`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 border border-[#3d0a20] bg-[#3d0a20] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#52102d]"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Label (4x6)
            </a>

            <a
              href={`https://www.dtdc.in/tracking.asp`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Track on DTDC
            </a>
          </div>
        </div>
      ) : (
        /* Create Shipment via DTDC API */
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDtdcShip}
            disabled={dtdcLoading}
            className="flex w-full items-center justify-center gap-2 border border-[#3d0a20] bg-[#3d0a20] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#52102d] disabled:opacity-50"
          >
            <Truck className="h-4 w-4" />
            {dtdcLoading ? "Booking DTDC Shipment…" : "Book DTDC Shipment"}
          </button>

          {dtdcError && (
            <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-xs text-red-700">{dtdcError}</p>
            </div>
          )}

          {/* Collapsible Package Dimensions */}
          <div className="border border-gray-200 bg-gray-50/50 p-3">
            <button
              type="button"
              onClick={() => setShowPackageDetails(!showPackageDetails)}
              className="flex w-full items-center justify-between text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              <span>Package Specs (Weight & Dimensions)</span>
              {showPackageDetails ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showPackageDetails && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div>
                  <label className="mb-0.5 block text-gray-500">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-2 py-1 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-gray-500">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="5"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-2 py-1 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-gray-500">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="5"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-2 py-1 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-gray-500">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-2 py-1 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual AWB Option Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowManualAwb(!showManualAwb)}
          className="text-xs text-gray-500 underline hover:text-gray-800"
        >
          {showManualAwb
            ? "Hide Manual AWB Entry"
            : "Manual AWB Entry / Re-assignment"}
        </button>

        {showManualAwb && (
          <form
            onSubmit={handleSaveAwb}
            className="mt-3 space-y-3 border-t border-gray-200 pt-3"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Manual AWB Number
              </label>
              <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Enter DTDC AWB number…"
                className="w-full border border-gray-200 px-3 py-2 font-mono text-sm focus:border-[#3d0a20] focus:outline-none"
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
              className="w-full border border-gray-400 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {awbLoading ? "Saving…" : "Save Manual AWB"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
