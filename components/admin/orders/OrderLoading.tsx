'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoadingUI() {
    return (
        <div className="container mx-auto py-6">
            <Card>
                <div className="p-4">
                    <Skeleton className="h-8 w-48 mb-6" />

                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </Card>
        </div>
    );
}