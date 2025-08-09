'use client'

import { useForm } from 'react-hook-form'
import { signInSchema } from '@/schemas/signInSchema'
import { SignIn, useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {z} from 'zod'
import { tr } from 'zod/locales'

export default function SignInForm() {
    const router = useRouter()
    const { signIn, isLoaded, setActive } = useSignIn()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [authError, setAuthError] = useState<String | null>(null)

    const {
        register,
        handleSubmit
    } = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

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
        <h1>Return a signIn form</h1>
    )
}