"use client"

import type { UserProfile } from "~/domain/auth/auth.types"
import type { User } from "@supabase/supabase-js"
import type { ReactNode } from "react"

import { CategoriesStoreSync } from "~/components/stores/categories-store-sync"
import { PermissionsStoreSync } from "~/components/stores/permissions-store-sync"
import { ProductsStoreSync } from "~/components/stores/products-store-sync"
import { RolesStoreSync } from "~/components/stores/roles-store-sync"
import { UsersStoreSync } from "~/components/stores/users-store-sync"
import { Toaster } from "~/components/ui/sonner"
import { TooltipProvider } from "~/components/ui/tooltip"

import { AuthProvider } from "./auth-provider"

type AppProvidersProps = {
  children: ReactNode
  initialUser: User | null
  initialProfile: UserProfile | null
}

/** Providers globales (auth, tema, query, etc.). */
export function AppProviders({
  children,
  initialUser,
  initialProfile,
}: AppProvidersProps) {
  return (
    <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
      <UsersStoreSync />
      <RolesStoreSync />
      <PermissionsStoreSync />
      <ProductsStoreSync />
      <CategoriesStoreSync />
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  )
}
