"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FraudHeatmapDoc {
  id: string;
  timestamp?: Timestamp;
  // On ne récupère que les fraudes, donc is_fraud est implicitement true
  // tx_id et autres champs ne sont pas nécessaires pour la heatmap elle-même, juste le timestamp de la fraude
}

export function useFraudHeatmapData() {
  const [heatmapDocs, setHeatmapDocs] = useState<FraudHeatmapDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, "fraud_predictions"),
      where("is_fraud", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp : undefined,
          } as FraudHeatmapDoc;
        }).filter(doc => doc.timestamp); // S'assurer que le timestamp existe pour la heatmap
        
        setHeatmapDocs(docsData);
        setIsLoading(false); // Mettre à jour isLoading après la première récupération
      },
      (err: any) => {
        console.error("Erreur lors de la récupération des données pour la heatmap (temps réel):", err);
        setError(err);
        setIsLoading(false);
      }
    );

    // Se désabonner lors du démontage du composant
    return () => unsubscribe();
  }, []); // Tableau de dépendances vide pour exécuter une seule fois au montage (l'abonnement)

  return { heatmapDocs, isLoading, error };
} 