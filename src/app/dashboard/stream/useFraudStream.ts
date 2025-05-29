"use client";
import { useEffect, useState } from "react";
import {
  collection, query, orderBy, limit, onSnapshot, DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useFraudStream(batch = 250) {
  const [docs, setDocs] = useState<DocumentData[]>([]);
  
  useEffect(() => {
    const q = query(
      collection(db, "fraud_predictions"),
      orderBy("timestamp", "desc"),
      limit(batch)
    );
    
    return onSnapshot(q, snap => {
      const changes = snap.docChanges();
      
      setDocs(prev => {
        let updated = [...prev];
        
        changes.forEach(change => {
          const docData = { ...change.doc.data(), id: change.doc.id };
          
          switch (change.type) {
            case "added":
              if (!updated.find(doc => doc.id === docData.id)) {
                updated = [docData, ...updated];
              }
              break;
              
            case "modified":
              const modifiedIndex = updated.findIndex(doc => doc.id === docData.id);
              if (modifiedIndex !== -1) {
                updated[modifiedIndex] = docData;
              }
              break;
              
            case "removed":
              updated = updated.filter(doc => doc.id !== docData.id);
              break;
          }
        });
        
        return updated
          .sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(0);
            const timeB = b.timestamp?.toDate?.() || new Date(0);
            return timeB.getTime() - timeA.getTime();
          })
          .slice(0, batch);
      });
    });
  }, [batch]);
  
  return docs;
} 