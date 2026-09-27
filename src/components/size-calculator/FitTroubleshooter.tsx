"use client";

import React, { useState } from "react";

import { AlertCircle, ChevronDown, Wrench } from "lucide-react";

import { FIT_PROBLEMS } from "@/lib/sizing/sizing-data";
import { cn } from "@/lib/utils";

export function FitTroubleshooter() {
  const [openProblem, setOpenProblem] = useState<string | null>(
    FIT_PROBLEMS[0].id
  );

  const toggleProblem = (id: string) => {
    setOpenProblem((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-[var(--accent)] uppercase">
          <Wrench className="h-3.5 w-3.5" />
          FitCode™ Diagnostic
        </div>
        <h3 className="mt-1 font-serif text-lg font-bold text-gray-900 sm:text-xl">
          Bra Fit Troubleshooter
        </h3>
        <p className="mt-0.5 text-xs text-gray-600">
          Experiencing discomfort in your current bras? Select your issue to
          diagnose the cause and find your immediate solution.
        </p>
      </div>

      <div className="divide-y divide-gray-200 border border-gray-200 bg-white">
        {FIT_PROBLEMS.map((item) => {
          const isOpen = openProblem === item.id;

          return (
            <div key={item.id} className="transition-colors">
              <button
                type="button"
                onClick={() => toggleProblem(item.id)}
                className="flex w-full items-center justify-between p-4 text-left font-serif text-sm font-bold text-gray-900 hover:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[10px] font-bold text-[var(--accent-plum)]">
                    !
                  </span>
                  <span>{item.problem}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                    isOpen && "rotate-180 text-[var(--accent)]"
                  )}
                />
              </button>

              {isOpen && (
                <div className="space-y-3 bg-pink-50/30 px-4 pt-1 pb-4 text-xs text-gray-700">
                  <div>
                    <strong className="block text-[11px] font-black tracking-wider text-gray-900 uppercase">
                      What happens:
                    </strong>
                    <p className="mt-0.5 text-gray-600">{item.symptom}</p>
                  </div>

                  <div>
                    <strong className="block text-[11px] font-black tracking-wider text-gray-900 uppercase">
                      Common causes:
                    </strong>
                    <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-gray-600">
                      {item.causes.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-start gap-2 rounded-none border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-950">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <strong className="font-bold text-emerald-900">
                        FitCode Solution:
                      </strong>{" "}
                      {item.solution}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
