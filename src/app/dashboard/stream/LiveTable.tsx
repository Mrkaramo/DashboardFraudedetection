"use client";
// import { DocumentData } from "firebase/firestore"; // Supprimé
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react"; // useEffect pourrait être utile si on ajoute des dépendances à des effets
import { ChevronDownIcon, ClipboardCopyIcon, CreditCardIcon, SearchIcon, FilterIcon } from "lucide-react";
import { useTransactionHistory, TransactionHistoryDoc } from "@/lib/hooks/useTransactionHistory"; // Import du hook

// export default function LiveTable({ data }: { data: DocumentData[] }) { // Ancienne signature
export default function LiveTable() { // Nouvelle signature
  const { transactions: allRecentTransactions, isLoading, error } = useTransactionHistory(100); // Récupère les 100 dernières transactions
  
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtrer les transactions fournies par le hook en fonction du terme de recherche
  // Le hook useTransactionHistory retourne déjà les transactions triées par timestamp (les plus récentes en premier dans l'ordre inversé du hook, donc chronologique)
  // Firestore les donne DESC, le hook les reverse en ASC pour les graphiques. Ici on veut DESC (plus récentes en haut).
  // Donc on re-reverse ou on demande au hook de ne pas reverser pour cet usage.
  // Pour simplifier ici, on va prendre les données du hook telles quelles (ASC) et les re-inverser pour la table (DESC).
  const filteredAndSortedTransactions = [...allRecentTransactions]
    .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)) // Assurer l'ordre DESC ici
    .filter(transaction => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      // S'assurer que les champs existent avant d'appeler toLowerCase()
      const merchantMatch = transaction.merchant && transaction.merchant.toLowerCase().includes(term);
      const categoryMatch = transaction.category && transaction.category.toLowerCase().includes(term);
      // transaction.state n'est pas dans TransactionHistoryDoc, à ajouter si besoin de filtrer dessus
      // const stateMatch = transaction.state && transaction.state.toLowerCase().includes(term);
      const idMatch = (transaction.id || transaction.tx_id) && (transaction.id || transaction.tx_id).toLowerCase().includes(term);
      return merchantMatch || categoryMatch || idMatch; // || stateMatch;
    })
    .slice(0, 15); // Limiter à 15 résultats après filtrage

  // Gestion du chargement
  if (isLoading) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Transactions récentes</h3>
          <p className="text-xs text-muted-foreground mt-1">Dernières transactions traitées par le système</p>
        </div>
        <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
          Chargement des transactions récentes...
        </div>
      </Card>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <Card className="card-elevated overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-lg font-medium">Transactions récentes</h3>
        </div>
        <div className="flex items-center justify-center h-[400px] text-destructive text-sm p-4 text-center">
          Erreur lors du chargement des transactions.
        </div>
      </Card>
    );
  }
  
  // Le reste du composant utilise `filteredAndSortedTransactions` au lieu de `recentTransactions`
  // Renommer la variable utilisée dans le JSX de recentTransactions à filteredAndSortedTransactions

  return (
    <Card className="card-elevated overflow-hidden">
      <div className="p-5 pb-3 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h3 className="text-lg font-medium">Transactions récentes</h3>
          <p className="text-xs text-muted-foreground mt-1">Dernières transactions traitées par le système</p>
        </div>
        
        <div className="relative w-full md:w-64 flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full rounded-full border border-border bg-background/80 backdrop-blur-sm py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all hover:border-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Le bouton filtre est là mais n'a pas de fonctionnalité active pour le moment */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted/80 transition-colors">
            <FilterIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Version desktop */} 
      <div className="hidden md:block px-5 pb-5">
        <div className="overflow-hidden rounded-xl border border-border/50">
          <table className="w-full border-collapse bg-card/50 backdrop-blur-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/30">
                <th className="p-3 text-left font-medium text-xs text-muted-foreground">ID Transaction</th>
                <th className="p-3 text-left font-medium text-xs text-muted-foreground">Date/Heure</th>
                <th className="p-3 text-left font-medium text-xs text-muted-foreground">Montant</th>
                <th className="p-3 text-left font-medium text-xs text-muted-foreground">Marchand</th>
                <th className="p-3 text-left font-medium text-xs text-muted-foreground">Catégorie</th>
                {/* <th className="p-3 text-left font-medium text-xs text-muted-foreground">État</th> Retiré car state n'est pas dans le hook */} 
                <th className="p-3 text-left font-medium text-xs text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground text-sm"> {/* colSpan ajusté */} 
                    {searchTerm ? "Aucune transaction ne correspond à votre recherche" : "Aucune transaction récente à afficher."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedTransactions.map((transaction) => {
                  const timestamp = transaction.timestamp?.toDate();
                  const formattedDate = timestamp 
                    ? format(timestamp, "dd MMM yyyy HH:mm:ss", { locale: fr })
                    : "N/A";
                  
                  const id = transaction.id || transaction.tx_id || "";
                  const shortId = id.substring(0, 8);
                  
                  return (
                    <tr 
                      key={id} 
                      className={`border-b border-border/20 transition-colors hover:bg-muted/10 ${transaction.is_fraud ? 'bg-destructive/5 dark:bg-destructive/10' : ''}`}
                    >
                      <td className="p-3 text-sm font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[100px]">{shortId}</span>
                          <button 
                            onClick={() => copyToClipboard(id)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                            title="Copier l'ID complet"
                          >
                            <ClipboardCopyIcon className={`h-3.5 w-3.5 ${copiedId === id ? 'text-success' : ''}`} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{formattedDate}</td>
                      <td className="p-3 text-sm font-medium">{transaction.amount?.toFixed(2) || 0}€</td>
                      <td className="p-3 text-sm">{transaction.merchant || "N/A"}</td>
                      <td className="p-3 text-sm">{transaction.category || "N/A"}</td>
                      {/* <td className="p-3 text-sm">{transaction.state || "N/A"}</td> Retiré */}
                      <td className="p-3 text-sm">
                        <span 
                          className={`status-pill inline-flex items-center ${transaction.is_fraud ? 'bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-destructive-foreground' : 'bg-success/15 text-success dark:bg-success/25 dark:text-success-foreground'}`}
                        >
                          {transaction.is_fraud ? "Fraude" : "Légitime"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Version mobile - cartes empilées */} 
      <div className="md:hidden px-4 pb-4 space-y-3">
        {filteredAndSortedTransactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            {searchTerm ? "Aucune transaction ne correspond à votre recherche" : "Aucune transaction récente à afficher."}
          </div>
        ) : (
          filteredAndSortedTransactions.map((transaction) => {
            const timestamp = transaction.timestamp?.toDate();
            const formattedDate = timestamp 
              ? format(timestamp, "dd MMM yyyy HH:mm", { locale: fr })
              : "N/A";
            
            const id = transaction.id || transaction.tx_id || "";
            const shortId = id.substring(0, 8);
            const isExpanded = expandedRow === id;
            
            return (
              <div 
                key={id} 
                className={`border rounded-xl overflow-hidden shadow-sm transition-all ${transaction.is_fraud ? 'bg-destructive/5 dark:bg-destructive/10 border-destructive/20' : 'bg-card border-border/50'} ${isExpanded ? 'shadow-md' : ''}`}
              >
                <div 
                  className="p-3 flex justify-between items-center cursor-pointer transition-colors hover:bg-muted/10"
                  onClick={() => setExpandedRow(isExpanded ? null : id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full p-1.5 ${transaction.is_fraud ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                      <CreditCardIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{transaction.merchant || "Transaction"}</div>
                      <div className="text-xs text-muted-foreground">{formattedDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">{transaction.amount?.toFixed(2) || 0}€</div>
                      <div className={`text-xs ${transaction.is_fraud ? 'text-destructive' : 'text-success'}`}>
                        {transaction.is_fraud ? "Fraude" : "Légitime"}
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 space-y-2 text-sm border-t border-border/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">ID</div>
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <span className="truncate">{shortId}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(id);
                            }}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                          >
                            <ClipboardCopyIcon className={`h-3 w-3 ${copiedId === id ? 'text-success' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Catégorie</div>
                        <div>{transaction.category || "N/A"}</div>
                      </div>
                      {/* Section État retirée des détails mobiles aussi */}
                      {/* <div>
                        <div className="text-xs text-muted-foreground">État</div>
                        <div>{transaction.state || "N/A"}</div>
                      </div> */}
                      <div>
                        <div className="text-xs text-muted-foreground">Montant</div>
                        <div className="font-medium">{transaction.amount?.toFixed(2) || 0}€</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
} 