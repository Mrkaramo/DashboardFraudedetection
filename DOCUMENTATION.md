# Documentation du Frontend - Dashboard de Détection de Fraude

## Table des matières

1. [Introduction](#introduction)
2. [Architecture technique](#architecture-technique)
3. [Structure du projet](#structure-du-projet)
4. [Flux de données](#flux-de-données)
5. [Gestion d'état avec Zustand](#gestion-détat-avec-zustand)
6. [Composants principaux](#composants-principaux)
   - [DashboardLayout (Layout principal)](#dashboardlayout-layout-principal)
   - [DashboardHeader (En-tête)](#dashboardheader-en-tête)
   - [DashboardSidebar (Barre latérale)](#dashboardsidebar-barre-latérale)
   - [Stream (Dashboard principal)](#stream-dashboard-principal)
   - [KPICards (Cartes d'indicateurs)](#kpicards-cartes-dindicateurs)
   - [AmountLine (Graphique des montants)](#amountline-graphique-des-montants)
   - [HourHeatmap (Carte thermique horaire)](#hourheatmap-carte-thermique-horaire)
   - [MapFraud (Carte des fraudes)](#mapfraud-carte-des-fraudes)
   - [LiveTable (Tableau des transactions)](#livetable-tableau-des-transactions)
   - [ActivityChart (Graphique d'activité)](#activitychart-graphique-dactivité)
   - [PeriodSelector (Sélecteur de période)](#periodselector-sélecteur-de-période)
7. [Visualisations et graphiques détaillés](#visualisations-et-graphiques-détaillés)
8. [Hooks personnalisés](#hooks-personnalisés)
9. [Intégration Firebase](#intégration-firebase)
10. [Thème et styles](#thème-et-styles)
11. [Optimisations et bonnes pratiques](#optimisations-et-bonnes-pratiques)

## Introduction

Le dashboard de détection de fraude est une application frontend moderne développée avec Next.js 15, conçue pour visualiser et analyser en temps réel les transactions frauduleuses.

Cette application propose plusieurs visualisations pour aider les analystes à identifier rapidement les fraudes potentielles, comprendre les tendances, et explorer les données détaillées des transactions suspectes. Elle intègre une gestion d'état centralisée avec Zustand et une interface utilisateur moderne inspirée du design Apple.

## Architecture technique

### Technologies principales

- **Next.js 15** : Framework React avec App Router et rendu côté serveur (SSR)
- **React 19** : Dernière version de React avec les nouvelles fonctionnalités
- **TypeScript 5** : Pour le typage statique et une meilleure maintenabilité
- **Tailwind CSS 4** : Framework CSS utilitaire pour les styles
- **Zustand** : Gestion d'état légère et performante
- **Firebase/Firestore** : Base de données en temps réel
- **Recharts** : Bibliothèque de visualisation de données
- **Nivo** : Composants de visualisation avancés (heatmap)
- **Framer Motion** : Animations fluides et interactions
- **React Hook Form + Zod** : Gestion des formulaires avec validation
- **TanStack Query** : Gestion des requêtes et cache
- **next-themes** : Gestion des thèmes clair/sombre

### Nouvelles dépendances ajoutées

- **@nivo/core & @nivo/heatmap** : Pour les cartes thermiques avancées
- **react-simple-maps & d3-geo** : Pour les cartes géographiques
- **date-fns** : Manipulation des dates
- **class-variance-authority & clsx** : Gestion des classes CSS conditionnelles
- **tw-animate-css** : Animations CSS personnalisées

### Compatibilité et responsive design

L'application est conçue pour fonctionner sur différents appareils avec une approche "mobile-first". Les composants s'adaptent automatiquement aux dimensions de l'écran grâce aux classes utilitaires de Tailwind CSS et aux breakpoints personnalisés.

## Structure du projet

```
frontend/
│
├── src/
│   ├── app/                   # Structure des routes Next.js (App Router)
│   │   ├── globals.css        # Styles globaux et configuration des thèmes
│   │   ├── layout.tsx         # Layout racine de l'application
│   │   ├── page.tsx           # Page d'accueil
│   │   └── dashboard/         # Route du tableau de bord
│   │       ├── page.tsx       # Page principale du dashboard
│   │       └── stream/        # Composants de visualisation
│   │           ├── Stream.tsx         # Conteneur principal
│   │           ├── KPICards.tsx       # Cartes d'indicateurs clés
│   │           ├── LiveTable.tsx      # Tableau des transactions
│   │           ├── useFraudStream.ts  # Hook personnalisé pour les données
│   │           └── Charts/            # Composants de visualisation
│   │               ├── AmountLine.tsx      # Graphique des montants
│   │               ├── HourHeatmap.tsx     # Carte thermique horaire
│   │               └── MapFraud.tsx        # Carte des fraudes
│   │
│   ├── components/            # Composants UI réutilisables
│   │   ├── dashboard-layout.tsx       # Layout principal du dashboard
│   │   ├── dashboard-header.tsx       # En-tête avec navigation
│   │   ├── dashboard-sidebar.tsx      # Barre latérale de navigation
│   │   ├── period-selector.tsx        # Sélecteur de période
│   │   ├── theme-toggle.tsx           # Bouton de changement de thème
│   │   ├── theme-provider.tsx         # Fournisseur de thème
│   │   ├── charts/                    # Composants de graphiques
│   │   │   └── activity-chart.tsx     # Graphique d'activité
│   │   └── ui/                        # Composants UI de base
│   │       ├── button.tsx             # Boutons stylisés
│   │       ├── card.tsx               # Cartes avec variants
│   │       ├── skeleton.tsx           # Squelettes de chargement
│   │       └── table.tsx              # Tableaux stylisés
│   │
│   ├── lib/                   # Utilitaires et configuration
│   │   ├── firebase.ts        # Configuration de Firebase
│   │   ├── store.ts           # Store Zustand global
│   │   └── utils.ts           # Fonctions utilitaires
│   │
│   └── types/                 # Définitions de types TypeScript
│       └── react-simple-maps.d.ts    # Types pour les cartes
│
├── public/                    # Ressources statiques
├── package.json              # Dépendances et scripts
├── next.config.ts            # Configuration Next.js
├── tailwind.config.js        # Configuration Tailwind CSS
├── tsconfig.json             # Configuration TypeScript
└── components.json           # Configuration des composants UI
```

## Flux de données

L'application suit un flux de données unidirectionnel avec une gestion d'état centralisée :

1. **Store Zustand** : Gère l'état global de l'application (filtres, thème, sidebar)
2. **Firebase Realtime** : Les données sont récupérées en temps réel via le hook `useFraudStream`
3. **Distribution** : Les données sont transmises au composant `Stream` qui les distribue
4. **Visualisation** : Chaque composant traite et transforme les données pour sa visualisation
5. **Interactions** : Les interactions utilisateur mettent à jour le store Zustand

### Diagramme de flux de données

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│   Firestore  │────▶│  useFraudStream │────▶│      Stream         │
└─────────────┘     └─────────────────┘     └──────────┬──────────┘
                                                       │
┌─────────────────┐                                    │
│  Zustand Store  │◄───────────────────────────────────┼──────────────┐
└─────────────────┘                                    │              │
        │                                              ▼              ▼
        ▼                                    ┌─────────────────┐ ┌─────────────────┐
┌─────────────────┐                          │    KPICards     │ │   LiveTable     │
│ Global Filters  │                          └─────────────────┘ └─────────────────┘
│ Theme State     │                                    │
│ UI State        │                                    ▼
└─────────────────┘                          ┌─────────────────┐
                                             │     Charts      │
                                             └─────────────────┘
                                                       │
                              ┌──────────────────────────────────────┐
                              ▼                    ▼                 ▼
                    ┌─────────────────┐  ┌─────────────────┐ ┌─────────────────┐
                    │   AmountLine    │  │   HourHeatmap   │ │    MapFraud     │
                    └─────────────────┘  └─────────────────┘ └─────────────────┘
```

## Gestion d'état avec Zustand

### Store principal

Le store Zustand centralise la gestion d'état de l'application avec les fonctionnalités suivantes :

**États gérés :**

- **Thème** : Mode clair/sombre
- **Filtres de période** : Jour, semaine, mois, année
- **Filtres d'alertes** : Niveaux de criticité
- **Interface utilisateur** : État du sidebar, recherche
- **Filtres de fraude** : État, marchand, catégorie, seuil de probabilité

**Exemple d'utilisation :**

```tsx
import { useDashboardStore } from "@/lib/store";

function MonComposant() {
  const { currentPeriod, setPeriod, searchQuery, setSearchQuery } =
    useDashboardStore();

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={() => setPeriod("week")}>Cette semaine</button>
    </div>
  );
}
```

### Avantages de Zustand

- **Performance** : Pas de re-renders inutiles
- **Simplicité** : API minimaliste et intuitive
- **TypeScript** : Support natif complet
- **Devtools** : Intégration avec Redux DevTools
- **Taille** : Très léger (2.5kb gzippé)

## Composants principaux

### DashboardLayout (Layout principal)

Nouveau composant de layout qui structure l'interface principale du dashboard.

**Fonctionnalités :**

- Structure flex responsive
- Intégration de l'en-tête et de la sidebar
- Zone de contenu principal adaptative

```tsx
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

### DashboardHeader (En-tête)

Composant d'en-tête moderne avec fonctionnalités de navigation et recherche.

**Fonctionnalités :**

- Logo et branding
- Barre de recherche globale
- Notifications avec badge
- Bouton de changement de thème
- Design sticky avec backdrop blur

**Caractéristiques techniques :**

- Position sticky pour rester visible au scroll
- Backdrop blur pour un effet moderne
- Responsive design avec adaptation mobile

### Stream (Dashboard principal)

Le composant `Stream` reste le conteneur principal mais a été amélioré avec de nouvelles fonctionnalités.

## Visualisations et graphiques détaillés

Cette section présente les différents outils de visualisation développés pour faciliter l'analyse des données de fraude et permettre une prise de décision éclairée par les analystes.

### 1. Carte thermique de distribution temporelle (HourHeatmap)

**Objectif analytique :**
La carte thermique horaire constitue un outil d'analyse temporelle permettant d'identifier les patterns de fraude selon les créneaux horaires et les jours de la semaine. Cette visualisation révèle les périodes de forte activité frauduleuse et aide à optimiser les ressources de surveillance.

**Fonctionnalités opérationnelles :**

- Matrice 24x7 représentant l'intégralité de la semaine avec une granularité horaire
- Échelle colorimétrique progressive indiquant l'intensité de l'activité frauduleuse
- Système de tooltips fournissant le nombre exact de fraudes par cellule
- Légende dynamique s'adaptant automatiquement au volume maximal détecté

**Valeur ajoutée pour l'analyse :**
Cette visualisation permet aux analystes d'identifier rapidement les créneaux à risque élevé, de détecter des patterns récurrents dans les activités frauduleuses, et d'adapter les stratégies de surveillance en fonction des tendances temporelles observées.

### 2. Graphique chronologique des montants (AmountLine)

**Objectif analytique :**
Ce graphique en aires visualise l'évolution temporelle des montants de transactions en mettant en évidence les opérations frauduleuses. Il permet d'analyser les tendances financières et d'identifier les pics d'activité suspecte.

**Fonctionnalités opérationnelles :**

- Représentation chronologique des 50 dernières transactions avec tri automatique
- Marquage visuel distinctif des transactions frauduleuses par des indicateurs colorés
- Tooltips contextuels affichant l'heure, le montant et le statut de fraude
- Formatage automatique des axes temporels et monétaires

**Valeur ajoutée pour l'analyse :**
Cette visualisation facilite l'identification des anomalies de montants, permet de corréler les fraudes avec les volumes financiers, et aide à détecter les tentatives de fraude par petits montants répétés ou par montants exceptionnellement élevés.

### 3. Système de géolocalisation des fraudes (MapFraud)

**Objectif analytique :**
Ce composant présente une analyse géographique des fraudes détectées, classées par niveau de risque et enrichies d'informations contextuelles. Il permet une approche territoriale de la lutte contre la fraude.

**Structure informationnelle :**
Chaque fraude géolocalisée comprend l'identifiant unique, la localisation géographique (état/région, coordonnées), le montant de la transaction, l'horodatage, la catégorie de transaction, le marchand impliqué, le type de carte utilisé, et un score de risque calculé.

**Classification des niveaux de risque :**

- **Niveau critique** (≥900€) : Transactions nécessitant une intervention immédiate
- **Niveau élevé** (≥700€) : Transactions requérant une surveillance renforcée
- **Niveau moyen** (≥500€) : Transactions nécessitant une attention modérée
- **Niveau faible** (<500€) : Transactions sous surveillance standard

**Valeur ajoutée pour l'analyse :**
Cette approche géographique permet d'identifier les zones à forte concentration de fraudes, de détecter les patterns géographiques suspects, et de corréler les activités frauduleuses avec des événements ou des caractéristiques territoriales spécifiques.

### 4. Analyse comparative d'activité (ActivityChart)

**Objectif analytique :**
Ce graphique compare l'évolution des fraudes détectées par rapport au volume global de transactions sur une période de 14 jours, permettant d'évaluer l'efficacité du système de détection et d'identifier les tendances.

**Métriques analysées :**

- Volume quotidien de fraudes détectées avec courbe de tendance
- Volume total de transactions pour contextualiser l'activité
- Calcul automatique du taux de fraude quotidien
- Identification des pics d'activité et des anomalies temporelles

**Valeur ajoutée pour l'analyse :**
Cette visualisation comparative permet d'évaluer les performances du système de détection, d'identifier les périodes de forte activité frauduleuse, et de mesurer l'évolution du risque dans le temps pour ajuster les stratégies de prévention.

### 5. Tableau de bord des indicateurs clés (KPICards)

**Objectif analytique :**
Les cartes d'indicateurs fournissent une vue synthétique des métriques essentielles du système de détection de fraude, permettant un monitoring en temps réel des performances.

**Indicateurs de performance :**

1. **Volume total de transactions** : Nombre global de transactions analysées avec indicateur d'évolution par rapport à la période précédente

2. **Fraudes détectées** : Nombre absolu de fraudes identifiées avec indicateur de tendance et badge de criticité selon le volume

3. **Taux de fraude** : Pourcentage calculé (fraudes/total × 100) avec seuil d'alerte visuel et comparaison avec la moyenne historique

4. **Montant moyen des fraudes** : Valeur moyenne des transactions frauduleuses avec indicateur de variation et formatage monétaire

**Valeur ajoutée pour l'analyse :**
Ces indicateurs permettent un suivi en temps réel de l'efficacité du système, facilitent la détection d'anomalies dans les patterns de fraude, et fournissent des métriques quantifiables pour l'évaluation des performances et la prise de décision stratégique.

### 6. Interface de consultation des transactions (LiveTable)

**Objectif analytique :**
Ce tableau interactif présente les transactions récentes avec des fonctionnalités de recherche et de filtrage avancées, permettant une analyse détaillée et une investigation approfondie des cas suspects.

**Informations présentées :**

- Identifiant unique de transaction avec fonction de copie pour traçabilité
- Identification du marchand et catégorie de transaction
- Montant avec formatage monétaire automatique
- Localisation géographique (état/région)
- Statut de fraude avec indicateur visuel
- Horodatage précis de la transaction

**Fonctionnalités de recherche et filtrage :**

- Recherche globale en temps réel sur l'ensemble des champs
- Filtrage insensible à la casse avec correspondance partielle
- Limitation intelligente à 15 résultats pour optimiser la lisibilité
- Interface responsive s'adaptant aux différents supports de consultation

**Valeur ajoutée pour l'analyse :**
Cette interface permet une investigation détaillée des transactions suspectes, facilite la recherche d'informations spécifiques, et offre une traçabilité complète pour les besoins d'audit et de conformité réglementaire.

### Impact opérationnel des visualisations

L'ensemble de ces outils de visualisation constitue un écosystème analytique complet permettant :

- **Détection proactive** : Identification rapide des patterns anormaux et des tendances émergentes
- **Analyse multidimensionnelle** : Approche temporelle, géographique, et financière de la fraude
- **Prise de décision éclairée** : Métriques quantifiables et visualisations intuitives pour les analystes
- **Optimisation des ressources** : Allocation efficace des moyens de surveillance selon les zones et créneaux à risque
- **Traçabilité et conformité** : Documentation complète des transactions et des décisions d'analyse

Cette architecture de visualisation répond aux exigences opérationnelles d'un système de détection de fraude moderne, en combinant performance technique et ergonomie d'utilisation pour maximiser l'efficacité des équipes d'analyse.
