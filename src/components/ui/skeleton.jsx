import React from 'react';

export const Skeleton = ({ className = "", ...props }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} {...props} />
);

export const RecipeSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1,2,3,4].map(i => (
      <div key={i} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
        <Skeleton className="w-10 h-10 rounded-full mb-2" />
        <Skeleton className="h-6 w-12 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);

export const CalendarSkeleton = () => (
  <div className="grid grid-cols-5 gap-2">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="flex flex-col items-center p-3 bg-white rounded-lg border">
        <Skeleton className="h-4 w-8 mb-1" />
        <Skeleton className="h-8 w-8" />
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="p-4 bg-gray-50 rounded-xl text-center">
          <Skeleton className="w-8 h-8 mx-auto mb-2" />
          <Skeleton className="h-4 w-12 mx-auto mb-1" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);