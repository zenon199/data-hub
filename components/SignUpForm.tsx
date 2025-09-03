'use client'

import { useSignUp } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

//zod custom schema
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { signUpSchema } from '@/schemas/signUpSchema'

export default function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const [verifying, setVerifying] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)
    const [verificationError, setVerificationError] = useState<string | null>(null)
    const [verificationCode, setVerificationCode] = useState('')

    const { signUp, isLoaded, setActive } = useSignUp()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: '',
            password: '',
            passwordConfirmation: '',
        }
    })

    const handleGoogleSignUp = async () => {
        if (!isLoaded) return
        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/dashboard",
                redirectUrlComplete: "/dashboard"
            })
        } catch (error) {
            console.error('Google sign up error:', error)
            setAuthError('Failed to sign up with Google. Please try again.')
        }
    }

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        if (!isLoaded) return
        setIsSubmitting(true)
        setAuthError(null)

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            })
            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code'
            })
            setVerifying(true)
        } catch (error: any) {
            console.log('SignUp error: ', error)
            setAuthError(
                error.errors?.[0]?.message || 'An error occured during signUp. Please try again'
            )
        } finally {
            setIsSubmitting(false)
        }
    }
    
    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isLoaded || !signUp) return
        setIsSubmitting(true)
        setVerificationError(null)
        
        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode
            })
            console.log(result)

            if (result.status === 'complete') {
                await setActive({
                    session: result.createdSessionId
                })
                router.push('/dashboard')
            } else {
                console.error('Verification incomplete', result)
                setVerificationError(
                    'Verification could not be completed'
                )
            }
        } catch (error: any) {
            console.log('Verification error: ', error)
            setVerificationError(
                error.errors?.[0]?.message || 'An error occured during Verification. Please try again'
            )
        } finally {
            setIsSubmitting(false)
        }
    }
    
    if (verifying) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Verify your email</CardTitle>
                        <CardDescription>
                            We've sent a verification code to your email
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerificationSubmit}>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="verificationCode">Verification Code</Label>
                                    <Input
                                        id="verificationCode"
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        required
                                    />
                                </div>
                                {verificationError && (
                                    <p className="text-sm text-red-500 text-center">{verificationError}</p>
                                )}
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Verifying...' : 'Verify Email'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create an account</CardTitle>
                    <CardDescription>
                        Sign up with your Google account or email
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
                                    onClick={handleGoogleSignUp}
                                    disabled={!isLoaded}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Sign up with Google
                                </Button>
                            </div>
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-card text-muted-foreground relative z-10 px-2">
                                    Or continue with
                                </span>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...register('email')}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
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
                                <div className="grid gap-3">
                                    <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                                    <Input 
                                        id="passwordConfirmation" 
                                        type="password" 
                                        {...register('passwordConfirmation')}
                                        required 
                                    />
                                    {errors.passwordConfirmation && (
                                        <p className="text-sm text-red-500">{errors.passwordConfirmation.message}</p>
                                    )}
                                </div>
                                {authError && (
                                    <p className="text-sm text-red-500 text-center">{authError}</p>
                                )}
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating account...' : 'Create account'}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/sign-in" className="underline underline-offset-4">
                                    Sign in
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