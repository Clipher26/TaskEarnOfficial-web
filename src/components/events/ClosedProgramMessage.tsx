"use client";

import { useRouter } from "next/navigation";

interface ClosedProgramMessageProps {
  programTitle?: string;
  nextProgramDate?: string;
}

export function ClosedProgramMessage({ programTitle, nextProgramDate }: ClosedProgramMessageProps) {
  const router = useRouter();

  return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        This Program Has Ended
      </h2>
      <p className="text-gray-600 mb-4">
        {programTitle ? `${programTitle} is now closed. Thanks to everyone who participated!` : "This program is now closed."}
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">🎉</span>
          <span className="text-gray-700 font-medium">
            More programs coming soon!
          </span>
          <span className="text-2xl">🎉</span>
        </div>
        {nextProgramDate && (
          <p className="text-sm text-gray-500 mt-2">
            Next program starts: {new Date(nextProgramDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <button
        onClick={() => router.push("/events/upcoming")}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
      >
        View Upcoming Programs
      </button>
    </div>
  );
}