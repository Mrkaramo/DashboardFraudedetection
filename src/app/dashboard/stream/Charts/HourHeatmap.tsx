"use client";
// import { DocumentData } from "firebase/firestore"; // Plus besoin de DocumentData directement
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useFraudHeatmapData, FraudHeatmapDoc } from "@/lib/hooks/useFraudHeatmapData"; // Import du nouveau hook

// Jours de la semaine en français
const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Palettes de couleurs inspirées d'Apple
const couleursLight = [
  "bg-[var(--heat-1)]", "bg-[var(--heat-1)]", 
  "bg-[var(--heat-2)]", "bg-[var(--heat-2)]", 
  "bg-[var(--heat-3)]", "bg-[var(--heat-3)]", 
  "bg-[var(--heat-4)]", "bg-[var(--heat-4)]"
];

const couleursDark = [
  "dark:bg-[var(--heat-1)]", "dark:bg-[var(--heat-1)]", 
  "dark:bg-[var(--heat-2)]", "dark:bg-[var(--heat-2)]", 
  "dark:bg-[var(--heat-3)]", "dark:bg-[var(--heat-3)]", 
  "dark:bg-[var(--heat-4)]", "dark:bg-[var(--heat-4)]"
];

export default function HourHeatmap() { // Nouvelle signature
  const { heatmapDocs, isLoading, error } = useFraudHeatmapData();
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [dateLabels, setDateLabels] = useState<string[]>([]); // Nouvel état pour les étiquettes de date
  const [maxValue, setMaxValue] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<{dateIndex: number, heure: number} | null>(null); // dateIndex au lieu de jour
  const [tooltipData, setTooltipData] = useState<{x: number, y: number, content: string} | null>(null);
  
  useEffect(() => {
    if (heatmapDocs && heatmapDocs.length > 0) {
      const { grid, dateLabels: newDateLabels, max } = buildHourlyHeatmap(heatmapDocs);
      setHeatmapData(grid);
      setDateLabels(newDateLabels); // Mettre à jour les étiquettes de date
      setMaxValue(max);
    }
  }, [heatmapDocs]);
  
  // Gestion du chargement et des erreurs
  if (isLoading) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Distribution horaire des fraudes</h3>
          <p className="text-xs text-muted-foreground mt-1">Carte thermique par heure et date</p>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
          Chargement des données de la heatmap...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Distribution horaire des fraudes</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-destructive text-sm p-4 text-center">
          Erreur lors du chargement des données pour la carte thermique.
        </div>
      </Card>
    );
  }
  
  // Si pas de données (après chargement et sans erreur), afficher un message
  if (heatmapDocs.length === 0) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Distribution horaire des fraudes</h3>
          <p className="text-xs text-muted-foreground mt-1">Carte thermique par heure et date</p>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
          Aucune donnée de fraude à afficher pour la heatmap.
        </div>
      </Card>
    );
  }

  // Fonction pour choisir la couleur en fonction de la valeur
  const getColorClass = (value: number, dateIndex: number, heure: number) => {
    if (value === 0) return "bg-muted/30 dark:bg-muted/10 heatmap-cell";
    
    const isHovered = hoveredCell?.dateIndex === dateIndex && hoveredCell?.heure === heure;
    const baseIndex = Math.min(Math.floor((value / maxValue) * (couleursLight.length - 1)), couleursLight.length - 1);
    const hoverIndex = Math.min(baseIndex + 1, couleursLight.length - 1);
    
    const index = isHovered ? hoverIndex : baseIndex;
    return `${couleursLight[index]} ${couleursDark[index]} heatmap-cell transform transition-all duration-200 ${isHovered ? 'scale-105 z-10 shadow-sm' : ''}`;
  };
  
  // Fonction pour créer un texte de tooltip
  const getCellTooltip = (value: number, dateLabel: string, heure: number) => {
    if (value === 0) return `${dateLabel} à ${heure}h: Aucune fraude`;
    return `${dateLabel} à ${heure}h: ${value} fraude${value > 1 ? 's' : ''}`;
  };
  
  // Gérer le positionnement du tooltip personnalisé
  const handleCellHover = (e: React.MouseEvent, dateIndex: number, heure: number, value: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCell({dateIndex, heure});
    
    if (value > 0 && dateLabels[dateIndex]) {
      setTooltipData({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 5,
        content: getCellTooltip(value, dateLabels[dateIndex], heure)
      });
    } else {
      setTooltipData(null);
    }
  };
  
  // Masquer le tooltip
  const handleCellLeave = () => {
    setHoveredCell(null);
    setTooltipData(null);
  };
  
  return (
    <Card className="card-elevated overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-lg font-medium">Distribution horaire des fraudes</h3>
        <p className="text-xs text-muted-foreground mt-1">Carte thermique par heure et date</p>
      </div>
      <div className="px-5 pb-5 relative overflow-x-auto">
        <div className="flex items-center mb-4">
          <div className="w-20 text-xs font-medium text-right text-muted-foreground pr-2 sticky left-0 bg-card z-10">Date / Heure</div>
          <div className="flex-1 grid grid-cols-24 gap-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={`header-${i}`} className="text-center text-[10px] text-muted-foreground font-medium min-w-[28px]">{i}h</div>
            ))}
          </div>
        </div>
        
        {/* Corps de la heatmap */}
        <div className="space-y-1.5">
          {dateLabels.map((dateLabel, dateIndex) => (
            <div key={`row-${dateIndex}`} className="flex items-center">
              <div className="w-20 text-xs font-medium text-right pr-2 sticky left-0 bg-card z-10">
                {new Date(dateLabel + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {Array.from({ length: 24 }, (_, heureIndex) => {
                  const value = heatmapData[heureIndex]?.[dateIndex] || 0;
                  return (
                    <div 
                      key={`cell-${dateIndex}-${heureIndex}`}
                      className={`h-7 rounded-[6px] flex items-center justify-center min-w-[28px] ${getColorClass(value, dateIndex, heureIndex)}`}
                      title={getCellTooltip(value, dateLabel, heureIndex)}
                      onMouseEnter={(e) => handleCellHover(e, dateIndex, heureIndex, value)}
                      onMouseLeave={handleCellLeave}
                    >
                      {value > 0 && (
                        <span className={`text-xs font-medium ${value > maxValue/2 ? 'text-white' : 'text-foreground'}`}>
                          {value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Légende */}
        <div className="flex items-center justify-center mt-6">
          <div className="text-xs text-muted-foreground mr-2">0</div>
          <div className="flex h-4">
            {couleursLight.map((couleur, i) => (
              <div
                key={`legend-${i}`}
                className={`w-8 ${couleur} ${couleursDark[i]} rounded-sm`}
                title={`${Math.round((i / (couleursLight.length - 1)) * maxValue)}`}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground ml-2">{heatmapDocs.length} fraude{heatmapDocs.length > 1 ? 's' : ''} (max par case: {maxValue})</div>
        </div>
        
        {/* Tooltip custom */}
        {tooltipData && (
          <div 
            className="custom-tooltip absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${tooltipData.x}px`,
              top: `${tooltipData.y}px`,
              opacity: 1,
              transition: 'opacity 150ms ease-in-out'
            }}
          >
            {tooltipData.content}
          </div>
        )}
      </div>
    </Card>
  );
}

// Fonction pour construire les données de heatmap
// Doit maintenant accepter FraudHeatmapDoc[]
function buildHourlyHeatmap(data: FraudHeatmapDoc[]) { 
  // La grille sera un objet où les clés sont les dates (YYYY-MM-DD)
  // et les valeurs sont des tableaux de 24 heures.
  const gridByDate: { [dateKey: string]: number[] } = {};
  const dateKeys: string[] = []; // Pour stocker les clés de date uniques et triées
  
  let maxCellValue = 0;
  
  data.forEach(doc => {
    if (doc.timestamp) { 
      const dateObj = doc.timestamp.toDate();
      const heure = dateObj.getHours();
      
      // Formatter la date en YYYY-MM-DD pour l'utiliser comme clé
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Mois de 0-11 -> 1-12
      const day = dateObj.getDate().toString().padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!gridByDate[dateKey]) {
        gridByDate[dateKey] = Array(24).fill(0);
        dateKeys.push(dateKey);
      }
      
      gridByDate[dateKey][heure]++;
      maxCellValue = Math.max(maxCellValue, gridByDate[dateKey][heure]);
    }
  });
  
  // Trier les clés de date pour un affichage chronologique
  dateKeys.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  // Optionnel: Limiter le nombre de jours affichés si trop nombreux, par ex. les 30 derniers jours
  // const MAX_DAYS_TO_DISPLAY = 30;
  // if (dateKeys.length > MAX_DAYS_TO_DISPLAY) {
  //   dateKeys = dateKeys.slice(-MAX_DAYS_TO_DISPLAY);
  // }

  // Construire la grille finale dans le format attendu par le composant de rendu
  // (une liste de colonnes horaires, où chaque colonne contient les valeurs pour les dates triées)
  const finalGrid: number[][] = Array(24).fill(0).map((_, hourIndex) => 
    dateKeys.map(dateKey => gridByDate[dateKey]?.[hourIndex] || 0)
  );

  return { grid: finalGrid, dateLabels: dateKeys, max: maxCellValue };
} 