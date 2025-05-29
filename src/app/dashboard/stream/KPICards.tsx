"use client";
// import { DocumentData } from "firebase/firestore"; // Plus besoin de DocumentData ici directement
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useKpiSummary, KpiSummaryData } from "@/lib/hooks/useKpiSummary"; // Import du nouveau hook

// Génération simplifiée des données
const generateSparklineData = (length: number, isPositive: boolean) => {
  const startPoint = Math.random() * 30 + 10;
  let current = startPoint;
  
  return Array.from({ length }, (_, i) => {
    const direction = isPositive ? 1 : -1;
    const noise = (Math.random() - 0.5) * 15;
    current += direction * (Math.random() * 5) + noise;
    current = Math.max(5, current);
    
    return {
      x: i,
      y: current
    };
  });
};

export default function KPICards() {
  const { summary, isLoading, error } = useKpiSummary();

  // Calcul des KPI à partir du summary
  const totalTransactions = summary?.totalTransactions || 0;
  const totalFraudulentTransactions = summary?.totalFraudulentTransactions || 0;
  const totalFraudAmount = summary?.totalFraudAmount || 0;

  const rate = totalTransactions > 0 
    ? ((totalFraudulentTransactions / totalTransactions) * 100).toFixed(1) 
    : "0.0";
  
  const avgFraudAmount = totalFraudulentTransactions > 0 
    ? (totalFraudAmount / totalFraudulentTransactions).toFixed(2) 
    : "0.00";

  // Gestion de l'état de chargement et des erreurs (affichage simple pour l'instant)
  if (isLoading) {
    // Vous pouvez retourner un skeleton loader ou un message plus élaboré
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="kpi-card card-hover h-[120px]">
            <div className="p-5 flex flex-col justify-center items-center">
              <div className="animate-pulse bg-muted-foreground/20 h-6 w-24 rounded-md mb-2"></div>
              <div className="animate-pulse bg-muted-foreground/20 h-4 w-16 rounded-md"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Erreur de chargement des KPI.</div>;
  }
  
  // Tendances simulées
  const totalTrend = { value: "+5.2%", isPositive: true };
  const fraudTrend = { value: "-2.1%", isPositive: true };
  const rateTrend = { value: "-1.3%", isPositive: true };
  const amountTrend = { value: "+3.8%", isPositive: true };
  
  // Données sparklines
  const totalSparkline = generateSparklineData(10, totalTrend.isPositive);
  const fraudSparkline = generateSparklineData(10, !fraudTrend.isPositive);
  const rateSparkline = generateSparklineData(10, !rateTrend.isPositive);
  const amountSparkline = generateSparklineData(10, amountTrend.isPositive);

  // Fonction pour dessiner sparkline SVG simplifiée
  const renderSparkline = (data: {x: number, y: number}[], color: string) => {
    const width = 70;
    const height = 24;
    const max = Math.max(...data.map(d => d.y));
    const min = Math.min(...data.map(d => d.y));
    const range = max - min;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.y - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={width} height={height} className="sparkline">
        <polyline points={points} stroke={color} />
      </svg>
    );
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="kpi-card card-hover">
        <div className="flex flex-col h-full relative">
          <div className="text-sm font-medium text-muted-foreground mb-2">Transactions totales</div>
          <div className="mt-1 flex justify-between items-end">
            <span className="text-3xl font-semibold text-primary">{totalTransactions}</span>
            <div className="flex flex-col items-end">
              <div className={`flex items-center text-xs ${totalTrend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {totalTrend.isPositive ? 
                  <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                }
                <span>{totalTrend.value}</span>
              </div>
              <div className="mt-1 opacity-60">
                {renderSparkline(totalSparkline, 'var(--primary)')}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
      </Card>
      
      <Card className="kpi-card card-hover">
        <div className="flex flex-col h-full relative">
          <div className="text-sm font-medium text-muted-foreground mb-2">Fraudes détectées</div>
          <div className="mt-1 flex justify-between items-end">
            <span className="text-3xl font-semibold text-destructive">{totalFraudulentTransactions}</span>
            <div className="flex flex-col items-end">
              <div className={`flex items-center text-xs ${fraudTrend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {fraudTrend.isPositive ? 
                  <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                }
                <span>{fraudTrend.value}</span>
              </div>
              <div className="mt-1 opacity-60">
                {renderSparkline(fraudSparkline, 'var(--destructive)')}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-destructive/20 to-transparent"></div>
        </div>
      </Card>
      
      <Card className="kpi-card card-hover">
        <div className="flex flex-col h-full relative">
          <div className="text-sm font-medium text-muted-foreground mb-2">Taux de fraude</div>
          <div className="mt-1 flex justify-between items-end">
            <span className="text-3xl font-semibold text-primary">{rate}%</span>
            <div className="flex flex-col items-end">
              <div className={`flex items-center text-xs ${rateTrend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {rateTrend.isPositive ? 
                  <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                }
                <span>{rateTrend.value}</span>
              </div>
              <div className="mt-1 opacity-60">
                {renderSparkline(rateSparkline, 'var(--chart-3)')}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
      </Card>
      
      <Card className="kpi-card card-hover">
        <div className="flex flex-col h-full relative">
          <div className="text-sm font-medium text-muted-foreground mb-2">Montant moyen des fraudes</div>
          <div className="mt-1 flex justify-between items-end">
            <span className="text-3xl font-semibold text-primary">{avgFraudAmount}€</span>
            <div className="flex flex-col items-end">
              <div className={`flex items-center text-xs ${amountTrend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {amountTrend.isPositive ? 
                  <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                }
                <span>{amountTrend.value}</span>
              </div>
              <div className="mt-1 opacity-60">
                {renderSparkline(amountSparkline, 'var(--chart-2)')}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
      </Card>
    </div>
  );
} 