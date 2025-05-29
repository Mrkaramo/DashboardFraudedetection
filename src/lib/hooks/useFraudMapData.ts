"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Interface basée sur celle utilisée dans MapFraud.tsx
export interface FraudMapDoc {
  id: string;
  is_fraud: true; // Pour s'assurer que c'est bien une fraude
  tx_id?: string; // tx_id peut exister
  long?: number;
  lat?: number;
  amount?: number;
  state?: string;
  timestamp?: Timestamp;
  category?: string;
  merchant?: string;
  // Ajoutez d'autres champs si votre carte ou modal les utilise directement
}

export function useFraudMapData() {
  const [fraudDocsForMap, setFraudDocsForMap] = useState<FraudMapDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "fraud_predictions"),
          where("is_fraud", "==", true) // Récupérer uniquement les fraudes
        );

        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            // Assurer que les champs nécessaires pour la carte sont présents et correctement typés
            return {
              id: doc.id,
              is_fraud: true, // On filtre par is_fraud, donc c'est vrai
              tx_id: data.tx_id,
              long: typeof data.long === 'number' ? data.long : undefined,
              lat: typeof data.lat === 'number' ? data.lat : undefined,
              amount: typeof data.amount === 'number' ? data.amount : 0,
              state: typeof data.state === 'string' ? data.state : "Inconnu",
              timestamp: data.timestamp instanceof Timestamp ? data.timestamp : undefined,
              category: typeof data.category === 'string' ? data.category : undefined,
              merchant: typeof data.merchant === 'string' ? data.merchant : undefined,
            } as FraudMapDoc;
          })
          .filter(doc => doc.lat !== undefined && doc.long !== undefined); // S'assurer que lat/long existent
        
        setFraudDocsForMap(docsData);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données pour la carte des fraudes:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Pourrait être converti en onSnapshot si une mise à jour en temps réel de la carte est souhaitée
  }, []);

  return { fraudDocsForMap, isLoading, error };
} 