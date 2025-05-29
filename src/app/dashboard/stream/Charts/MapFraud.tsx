"use client";
// import { DocumentData } from "firebase/firestore"; // Plus besoin de DocumentData directement
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useFraudMapData, FraudMapDoc } from "@/lib/hooks/useFraudMapData"; // Import du nouveau hook
import { AlertCircleIcon, ClipboardCopyIcon, MapPinIcon, TrendingUpIcon, ChevronRightIcon, ArrowUpRightIcon, XIcon, CalendarIcon, CreditCardIcon, MapIcon } from "lucide-react";

// Classification des niveaux de risque avec style Apple
const getRiskLevel = (amount: number) => {
  if (amount >= 900) return { level: 'critique', color: 'bg-destructive text-white' };
  if (amount >= 700) return { level: 'élevé', color: 'bg-[var(--heat-3)] text-white' };
  if (amount >= 500) return { level: 'moyen', color: 'bg-[var(--heat-2)] text-white' };
  return { level: 'faible', color: 'bg-[var(--success)] text-white' };
};

// Interface DetailedFraud, peut-être fusionner ou aligner avec FraudMapDoc si redondant
interface DetailedFraud {
  id: string;
  state: string;
  longitude?: number; // Rendre optionnel si filtré dans le hook
  latitude?: number;  // Rendre optionnel si filtré dans le hook
  amount: number;
  time?: Date;
  category?: string;
  merchant?: string;
  cardType?: string; // Ce champ n'est pas dans FraudMapDoc actuellement
  ip?: string;      // Ce champ n'est pas dans FraudMapDoc actuellement
  riskScore?: number; // Ce champ est simulé ci-dessous
}

// export default function MapFraud({ data }: { data: DocumentData[] }) { // Ancienne signature
export default function MapFraud() { // Nouvelle signature
  const { fraudDocsForMap, isLoading: isLoadingMapData, error: mapDataError } = useFraudMapData();
  
  // const [loaded, setLoaded] = useState(false); // Remplacé par isLoadingMapData
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(false);
  const [selectedFraud, setSelectedFraud] = useState<DetailedFraud | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // useEffect(() => {
  //   setLoaded(true); // Plus nécessaire, géré par le hook
  // }, []);

  // Effet pour reset le status de copie
  useEffect(() => {
    if (copiedId) {
      const timer = setTimeout(() => setCopiedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedId]);

  // Effet pour gérer l'appui sur la touche Escape pour fermer le modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showModal]);

  // Transformer les fraudDocsForMap pour correspondre à DetailedFraud et trier
  // Notons que lat/long sont garantis d'exister par le filtre dans useFraudMapData
  const fraudPoints: DetailedFraud[] = fraudDocsForMap
    .map(d => ({
      id: d.id || d.tx_id || 'unknown-id', // Assurer un ID
      longitude: d.long,
      latitude: d.lat,
      amount: d.amount || 0,
      state: d.state || "Unknown",
      time: d.timestamp?.toDate(),
      category: d.category || "Non spécifiée",
      merchant: d.merchant || "Non spécifié",
      // cardType et ip ne sont pas dans FraudMapDoc, à ajouter au hook si nécessaire ou garder simulé/vide
      cardType: "Inconnu", 
      ip: "Inconnue",
      riskScore: Math.floor(Math.random() * 100) + 1 // Simulé pour la démonstration, comme avant
    }))
    .sort((a, b) => b.amount - a.amount);
    // Plus de .slice(0, 50) ici, nous utilisons tous les points

  // Gestion du chargement et des erreurs pour les données de la carte
  if (isLoadingMapData) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Dernières fraudes détectées</h3>
          <p className="text-xs text-muted-foreground mt-1">Analyse par localisation et montant</p>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
          Chargement de la carte des fraudes...
        </div>
      </Card>
    );
  }

  if (mapDataError) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Dernières fraudes détectées</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-destructive text-sm p-4 text-center">
          Erreur lors du chargement des données pour la carte.
        </div>
      </Card>
    );
  }
  
  if (fraudPoints.length === 0) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Dernières fraudes détectées</h3>
          <p className="text-xs text-muted-foreground mt-1">Analyse par localisation et montant</p>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
          Aucune fraude géolocalisée disponible.
        </div>
      </Card>
    );
  }

  // Fonction pour gérer la copie de l'ID
  const copyToClipboard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
  };

  // Fonction pour ouvrir le modal avec la fraude sélectionnée
  const openFraudDetails = (fraud: DetailedFraud, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFraud(fraud);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedFraud(null);
    document.body.style.overflow = 'auto';
  };

  // Format d'affichage du temps écoulé
  const formatTimeAgo = (date?: Date): string => {
    if (!date) return "récemment";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    const diffHour = Math.round(diffMin / 60);
  
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    if (diffHour < 24) return `il y a ${diffHour} h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Format de date détaillé pour le modal
  const formatDetailedDate = (date?: Date): string => {
    if (!date) return "Date inconnue";
    const day = date.getDate();
    const month = date.toLocaleString('fr-FR', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}:${minutes}:${seconds}`;
  };

  return (
    <>
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Dernières fraudes détectées</h3>
            <p className="text-xs text-muted-foreground mt-1">Analyse par localisation et montant</p>
          </div>
          <div>
            <button 
              onClick={() => setExpandedView(!expandedView)}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              {expandedView ? "Vue simple" : "Vue détaillée"}
              <ChevronRightIcon className={`h-3 w-3 transition-transform ${expandedView ? "rotate-90" : ""}`} />
            </button>
          </div>
        </div>
        
        <div className="px-5 pb-5">
          <div className={`space-y-3 ${expandedView ? "max-h-[700px]" : "max-h-[420px]"} overflow-y-auto pr-1 transition-all duration-300`}>
            {fraudPoints.slice(0, expandedView ? fraudPoints.length : 8).map((point, index) => {
              const { level, color } = getRiskLevel(point.amount);
              const timeAgo = formatTimeAgo(point.time);
              
              return (
                <div 
                  key={point.id}
                  className="group bg-card/80 backdrop-blur-lg p-4 rounded-xl border border-border/30 hover:shadow-md hover:bg-card/95 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary/5`}>
                        <MapPinIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${color} flex items-center justify-center text-[10px] font-medium`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div className="font-medium">{point.state}</div>
                        <div className="font-semibold text-destructive">{point.amount.toFixed(2)}€</div>
                      </div>
                      
                      <div className="mt-1 flex justify-between items-center">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>
                            {point.latitude?.toFixed(2)}, {point.longitude?.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(point.id, e)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                            title="Copier l'ID"
                          >
                            <ClipboardCopyIcon className={`h-3 w-3 ${copiedId === point.id ? 'text-success' : ''}`} />
                          </button>
                        </div>
                        <div className="text-xs">
                          <span className={`status-pill ${color} text-[10px]`}>{level}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
                        <div>{String(timeAgo)}</div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="text-primary flex items-center gap-0.5 hover:underline"
                            onClick={(e) => openFraudDetails(point, e)}
                          >
                            <span>Détails</span>
                            <ArrowUpRightIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!expandedView && fraudPoints.length > 8 && (
              <button 
                onClick={() => setExpandedView(true)}
                className="w-full py-3 text-center text-sm text-primary hover:underline flex items-center justify-center gap-1"
              >
                <span>Afficher {fraudPoints.length - 8} fraudes supplémentaires</span>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/20 flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <AlertCircleIcon className="h-3.5 w-3.5 text-destructive" />
              <span>Total: {fraudPoints.length} fraudes géolocalisées</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUpIcon className="h-3.5 w-3.5" />
              <span>Données en temps réel (chargées au montage)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de détails de fraude - Style Apple simplifié */}
      {showModal && selectedFraud && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-0">
          <div 
            className="absolute inset-0 bg-black/20" 
            onClick={closeModal}
            aria-hidden="true"
          />
          
          <div 
            className="bg-card border border-border/40 rounded-xl shadow-lg w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête avec bouton de fermeture */}
            <div className="p-5 pb-3 border-b border-border/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[var(--title)]">Détails de la fraude</h3>
              <button 
                onClick={closeModal}
                className="rounded-full h-7 w-7 flex items-center justify-center hover:bg-muted/50 transition-colors"
                aria-label="Fermer"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6">
              {/* En-tête avec état et montant */}
              <div className="mb-6">
                <div className="text-xl font-medium">{selectedFraud.state}</div>
                <div className="text-xs text-muted-foreground mt-1 mb-3">ID: {selectedFraud.id}</div>
                <div className="text-2xl font-semibold text-destructive">{selectedFraud.amount.toFixed(2)}€</div>
                <div className="text-xs text-muted-foreground">Montant frauduleux</div>
              </div>
              
              {/* Sections d'information - Version simplifiée */}
              <div className="space-y-5">
                {/* Section Temporelle */}
                <div className="bg-muted/10 rounded-xl p-4 border border-border/10">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Informations temporelles</h4>
                  </div>
                  <div className="text-sm">
                    {selectedFraud.time ? (
                      formatDetailedDate(selectedFraud.time)
                    ) : (
                      <span className="text-muted-foreground">Date inconnue</span>
                    )}
                  </div>
                </div>
                
                {/* Section Transaction */}
                <div className="bg-muted/10 rounded-xl p-4 border border-border/10">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCardIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Détails de la transaction</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Marchand</span>
                      <span className="font-medium">{selectedFraud.merchant}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Catégorie</span>
                      <span className="font-medium">{selectedFraud.category}</span>
                    </div>
                  </div>
                </div>
                
                {/* Section Localisation */}
                <div className="bg-muted/10 rounded-xl p-4 border border-border/10">
                  <div className="flex items-center gap-2 mb-3">
                    <MapIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Localisation</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">État</span>
                      <span className="font-medium">{selectedFraud.state}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Coordonnées</span>
                      <span className="font-medium">{selectedFraud.latitude?.toFixed(4)}, {selectedFraud.longitude?.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 