import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AuthFormSkeleton() {
  return (
    <Card className="w-full max-w-md p-8" aria-busy="true" aria-label="Loading sign-in form">
      <div className="text-center mb-8 space-y-3">
        <Skeleton className="h-12 w-12 mx-auto rounded-full" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </div>
      <Skeleton className="h-12 w-full mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </Card>
  );
}
