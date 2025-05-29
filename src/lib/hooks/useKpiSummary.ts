"use client";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface KpiSummaryData {
  totalTransactions: number;
  totalFraudulentTransactions: number;
  totalFraudAmount: number;
  lastUpdated?: Timestamp; // Optionnel, si on veut afficher quand les stats ont été calculées
}

export function useKpiSummary() {
  const [summary, setSummary] = useState<KpiSummaryData>({
    totalTransactions: 0,
    totalFraudulentTransactions: 0,
    totalFraudAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "fraud_predictions")); // Requête sur toute la collection

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let currentTotalTransactions = 0;
        let currentTotalFraudulentTransactions = 0;
        let currentTotalFraudAmount = 0.0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          currentTotalTransactions++;

          if (data.is_fraud === true) { // Assurez-vous que le champ is_fraud est bien un booléen
            currentTotalFraudulentTransactions++;
            currentTotalFraudAmount += data.amount || 0; // Assurez-vous que amount est un nombre
          }
        });

        setSummary({
          totalTransactions: currentTotalTransactions,
          totalFraudulentTransactions: currentTotalFraudulentTransactions,
          totalFraudAmount: parseFloat(currentTotalFraudAmount.toFixed(2)),
          lastUpdated: Timestamp.now() // Ajout d'un timestamp de mise à jour côté client
        });
        setIsLoading(false);
      },
      (err) => {
        console.error("Erreur lors de l'écoute des transactions pour les KPI:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Nettoyage de l'écouteur
  }, []);

  return { summary, isLoading, error };
} 