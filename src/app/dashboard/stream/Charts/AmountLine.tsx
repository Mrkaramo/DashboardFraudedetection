"use client";
// import { DocumentData } from "firebase/firestore"; // Supprimé car on utilise le hook
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts";
import { useState, useEffect } from "react"; // useEffect peut être utile pour des choses comme la gestion de hoveredPoint si on l'étend
import { useTransactionHistory, TransactionHistoryDoc } from "@/lib/hooks/useTransactionHistory"; // Import du nouveau hook
import React from 'react'; // Ajout de l'import de React

// export default function AmountLine({ data }: { data: DocumentData[] }) { // Ancienne signature
export default function AmountLine() { // Nouvelle signature
  const { transactions, isLoading, error } = useTransactionHistory(50); // Récupère les 50 dernières transactions
  // const [hoveredPoint, setHoveredPoint] = useState<number | null>(null); // Gardé pour l'instant, mais son utilité directe est à confirmer
  
  // Préparer les données pour le graphique à partir du hook
  const chartData = transactions.map((doc, index) => ({
    id: doc.id,
    amount: doc.amount || 0,
    isFraud: doc.is_fraud || false,
    time: doc.timestamp?.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' }) || "", // Format HH:MM
    index // L'index est toujours utile pour certaines logiques de Recharts si besoin
  }));

  // Tooltip personnalisé (inchangé, mais s'assure qu'il utilise bien les champs de chartData)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload; // Renommé pour plus de clarté
      return (
        <div className="custom-tooltip"> {/* Assurez-vous que cette classe est stylée */} 
          <div className="font-medium mb-1.5">{dataPoint.time}</div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">{dataPoint.amount.toFixed(2)}€</span>
            {dataPoint.isFraud && (
              <span className="status-pill bg-destructive/15 text-destructive">Fraude</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Définir un gradient pour l'area chart (inchangé)
  const gradientId = "amountGradient";
  const gradientId2 = "amountGradientStroke";

  // Gestion du chargement et des erreurs
  if (isLoading) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Montants des transactions</h3>
          <p className="text-xs text-muted-foreground mt-1">Évolution chronologique des dernières transactions</p>
        </div>
        <div className="flex items-center justify-center h-[330px] text-muted-foreground text-sm chart-container mx-4 mb-4">
          Chargement des données du graphique...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Montants des transactions</h3>
        </div>
        <div className="flex items-center justify-center h-[330px] text-destructive text-sm p-4 text-center chart-container mx-4 mb-4">
          Erreur lors du chargement des données du graphique.
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Montants des transactions</h3>
          <p className="text-xs text-muted-foreground mt-1">Évolution chronologique des dernières transactions</p>
        </div>
        <div className="flex items-center justify-center h-[330px] text-muted-foreground text-sm chart-container mx-4 mb-4">
          Aucune transaction à afficher pour le moment.
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-elevated overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-lg font-medium">Montants des transactions</h3>
        <p className="text-xs text-muted-foreground mt-1">Évolution chronologique des dernières transactions</p>
      </div>
      <div className="px-2 h-[330px] chart-container mx-4 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} 
            margin={{ top: 10, right: 10, left: 5, bottom: 10 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id={gradientId2} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={1}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{fontSize: 10, fill: 'var(--muted-foreground)'}}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              tick={{fontSize: 10, fill: 'var(--muted-foreground)'}}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(val) => `${val}€`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="url(#amountGradientStroke)"
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              activeDot={{
                r: 4, 
                stroke: 'var(--card)', 
                strokeWidth: 2,
                fill: 'var(--primary)',
                className: 'data-point'
              }}
              dot={(props: { cx: number; cy: number; payload: any; index: number; /* Recharts passe aussi l'index */ }) : React.ReactElement => { 
                const { cx, cy, payload, index } = props; // `index` est aussi disponible via Recharts
                // Utiliser payload.id qui est l'ID de la transaction, ou fallback sur l'index pour la key
                const key = `dot-${payload.id || index}`; 
                if (payload.isFraud) {
                  return <circle key={key} cx={cx} cy={cy} r={3.5} fill="var(--destructive)" stroke="var(--card)" strokeWidth={1.5} className="badge-pulse" />;
                }
                // Le <g /> doit aussi avoir une key unique s'il fait partie de la liste rendue
                return <g key={key} />; 
              }}
              isAnimationActive={true}
              animationDuration={300}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 