import { create } from 'zustand'

// Types pour les périodes de filtrage
type FilterPeriod = 'day' | 'week' | 'month' | 'year'

// Types pour les filtres d'alerte
type AlertLevel = 'low' | 'medium' | 'high' | 'critical'

// Interface pour le store
interface DashboardStore {
  // État du thème
  isDarkMode: boolean
  setDarkMode: (isDark: boolean) => void
  
  // Filtres de période
  currentPeriod: FilterPeriod
  setPeriod: (period: FilterPeriod) => void
  
  // Filtres d'alertes
  selectedAlertLevels: AlertLevel[]
  toggleAlertLevel: (level: AlertLevel) => void
  
  // État du sidebar
  isSidebarOpen: boolean
  toggleSidebar: () => void
  
  // Filtres de recherche
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // État de chargement global
  isLoading: boolean
  setLoading: (isLoading: boolean) => void

  // Filtres pour la détection de fraude
  stateFilter: string | null
  setStateFilter: (state: string | null) => void
  
  merchantFilter: string | null
  setMerchantFilter: (merchant: string | null) => void
  
  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
  
  probThreshold: number
  setProbThreshold: (threshold: number) => void
}

// Création du store
export const useDashboardStore = create<DashboardStore>((set) => ({
  // État par défaut du thème
  isDarkMode: false,
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  
  // État par défaut des filtres de période
  currentPeriod: 'month',
  setPeriod: (period) => set({ currentPeriod: period }),
  
  // État par défaut des filtres d'alertes
  selectedAlertLevels: ['medium', 'high', 'critical'],
  toggleAlertLevel: (level) => 
    set((state) => ({
      selectedAlertLevels: state.selectedAlertLevels.includes(level)
        ? state.selectedAlertLevels.filter((l) => l !== level)
        : [...state.selectedAlertLevels, level]
    })),
  
  // État par défaut du sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // État par défaut du filtre de recherche
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // État par défaut du chargement
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  // État par défaut des filtres de fraude
  stateFilter: null,
  setStateFilter: (state) => set({ stateFilter: state }),
  
  merchantFilter: null,
  setMerchantFilter: (merchant) => set({ merchantFilter: merchant }),
  
  categoryFilter: null,
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  
  probThreshold: 0.5,
  setProbThreshold: (threshold) => set({ probThreshold: threshold })
})) 