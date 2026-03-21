"use client";

import { Suspense } from "react";
import LessonPageContent from "./LessonPageContent";
import { Skeleton } from "@/components/ui/skeleton";

function LessonLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={<LessonLoading />}>
      <LessonPageContent />
    </Suspense>
  );
}
