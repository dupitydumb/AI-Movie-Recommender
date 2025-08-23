"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "./toaster"

interface ProviderProps extends ColorModeProviderProps {
  children: React.ReactNode;
}

export function Provider({ children, ...props }: ProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <AuthProvider>
        <ColorModeProvider {...props}>
          {children}
          <Toaster />
        </ColorModeProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}
