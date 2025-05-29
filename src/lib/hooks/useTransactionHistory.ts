"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit, // Renommer pour éviter conflit avec le paramètre de la fonction
  onSnapshot,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface TransactionHistoryDoc {
  id: string;
  amount?: number;
  is_fraud?: boolean;
  timestamp?: Timestamp;
  // Ajoutez d'autres champs si nécessaire pour le graphique ou tooltip
  tx_id?: string; 
  category?: string;
}

export function useTransactionHistory(count: number = 50) { // count définit le nombre de dernières transactions à récupérer
  const [transactions, setTransactions] = useState<TransactionHistoryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const q = query(
      collection(db, "fraud_predictions"),
      orderBy("timestamp", "desc"), // Trier par timestamp descendant pour obtenir les plus récentes
      firestoreLimit(count) // Limiter au nombre `count` spécifié
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: typeof data.amount === 'number' ? data.amount : 0,
            is_fraud: typeof data.is_fraud === 'boolean' ? data.is_fraud : false,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp : undefined,
            tx_id: data.tx_id,
            category: data.category,
          } as TransactionHistoryDoc;
        });
        // Les données de onSnapshot sont déjà triées par Firestore (desc). 
        // Pour le graphique qui s'attend à un ordre chronologique (asc), on inverse ici.
        setTransactions(docsData.reverse());
        setIsLoading(false);
      },
      (err: any) => {
        console.error("Erreur lors de la récupération de l'historique des transactions:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Se désabonner lors du démontage du composant
  }, [count]); // Ré-exécuter si `count` change

  return { transactions, isLoading, error };
} 