"use client"

import * as React from "react"
import Link from "next/link"
import { 
  BarChart3, 
  Globe, 
  Home, 
  LineChart, 
  Settings, 
  ShieldAlert, 
  Users 
} from "lucide-react"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive 
          ? "bg-secondary text-secondary-foreground" 
          : "hover:bg-secondary/50 hover:text-secondary-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

export function DashboardSidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      
      <div className="flex flex-1 flex-col gap-1 p-3">
        <NavItem 
          href="/" 
          icon={<Home className="h-4 w-4" />} 
          label="Accueil" 
          isActive 
        />
        <NavItem 
          href="/analytics" 
          icon={<BarChart3 className="h-4 w-4" />} 
          label="Analytiques" 
        />
        <NavItem 
          href="/monitoring" 
          icon={<LineChart className="h-4 w-4" />} 
          label="Monitoring" 
        />
        <NavItem 
          href="/alerts" 
          icon={<ShieldAlert className="h-4 w-4" />} 
          label="Alertes" 
        />
        <NavItem 
          href="/geo" 
          icon={<Globe className="h-4 w-4" />} 
          label="Géographie" 
        />
        <NavItem 
          href="/users" 
          icon={<Users className="h-4 w-4" />} 
          label="Utilisateurs" 
        />
      </div>
      
      <div className="mt-auto p-3">
        <NavItem 
          href="/settings" 
          icon={<Settings className="h-4 w-4" />} 
          label="Paramètres" 
        />
      </div>
    </div>
  )
} 