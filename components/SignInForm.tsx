'use client'

import { signInSchema } from '@/schemas/signInSchema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function SignInForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const { signIn, isLoaded, setActive } = useSignIn()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [authError, setAuthError] = useState<String | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/dashboard",
                redirectUrlComplete: "/dashboard"
            })
        } catch (error) {
            console.error('Google sign in error:', error)
            setAuthError('Failed to sign in with Google. Please try again.')
        }
    }

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        if (!isLoaded) return

        setIsSubmitting(true)
        setAuthError(null)

        try {
            const result = await signIn.create({
                identifier: data.identifier,
                password: data.password
            })

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId })
                router.push('/dashboard')
            } else {
                console.error('SignIn incomplete', result)
                setAuthError(
                    'SignIn could not be completed'
                )
            }
        } catch (error: any) {
            console.log('Error in SignIn', error)
            setAuthError(
                error.errors?.[0]?.message || 'An error occured during SignIn. Please try again'
            )
        }
        finally {
            setIsSubmitting(false)
        }
    }
  
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your Google account or email
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="w-full"
                                    onClick={handleGoogleSignIn}
                                    disabled={!isLoaded}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Login with Google
                                </Button>
                            </div>
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-card text-muted-foreground relative z-10 px-2">
                                    Or continue with
                                </span>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="identifier">Email</Label>
                                    <Input
                                        id="identifier"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...register('identifier')}
                                        required
                                    />
                                    {errors.identifier && (
                                        <p className="text-sm text-red-500">{errors.identifier.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        {...register('password')}
                                        required 
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>
                                {authError && (
                                    <p className="text-sm text-red-500 text-center">{authError}</p>
                                )}
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Signing in...' : 'Login'}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/sign-up" className="underline underline-offset-4">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="/terms">Terms of Service</a>{" "}
                and <a href="/privacy">Privacy Policy</a>.
            </div>
        </div>
    )
}