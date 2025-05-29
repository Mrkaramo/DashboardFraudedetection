"use client";
import { useState, useEffect } from "react";
import { useFraudStream } from "./useFraudStream";
import KPICards from "./KPICards";
import LiveTable from "./LiveTable";
import AmountLine from "./Charts/AmountLine";
import HourHeatmap from "./Charts/HourHeatmap";
import MapFraud from "./Charts/MapFraud";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stream() {
  const data = useFraudStream(250);
  const [isLoading, setIsLoading] = useState(true);

  // Simuler un temps de chargement initial
  useEffect(() => {
    if (data.length > 0) {
      setIsLoading(false);
    }

    // Fallback en cas d'absence de données
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card-elevated p-4 h-[120px]">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elevated p-4">
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
          <div className="card-elevated p-4">
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </div>
        <div className="card-elevated p-4">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
        <div className="card-elevated p-4">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="fade-in delay-1">
        <KPICards data={data} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in delay-2">
        <AmountLine data={data} />
        <HourHeatmap data={data} />
      </div>
      
      <div className="fade-in delay-3">
        <MapFraud data={data} />
      </div>
      
      <div className="fade-in delay-4">
        <LiveTable data={data} />
      </div>
    </div>
  );
} 