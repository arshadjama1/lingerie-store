import React from "react";

export default function ShopTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-page-enter w-full flex-1">{children}</div>;
}
