"use client";

import React from "react";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white flex flex-col">{children}</div>;
}
