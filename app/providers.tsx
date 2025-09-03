'use client'

import { ImageKitProvider } from "imagekitio-next"
import type { ThemeProviderProps } from "next-themes"
import { ThemeProvider } from "next-themes"


export interface ProviderProps {
    children: React.ReactNode,
    themeProps?: ThemeProviderProps
}

const authenticator = async () => {
    try {
        const response = await fetch('/api/imagekit-auth')
        const data = await response.json()
        return data;
    } catch (error) {
        console.error('Authentication error:', error)
        throw error
    }
}

export function Providers({ children, themeProps }: ProviderProps) {
    return (
       
            <ImageKitProvider
                authenticator={authenticator}
                publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ''}
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}
            >
                <ThemeProvider attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </ImageKitProvider>
       
    )
}