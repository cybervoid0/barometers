'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AtSign, Eye, EyeOff } from 'lucide-react'
import * as UI from '@/components/ui'

interface SignInFormData {
  email: string
  password: string
}

// Yup validation schema
const signInSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export function SignInForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: SignInFormData) => {
    setIsLoading(true)
    try {
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (res?.ok) {
        toast.success('You have successfully logged in.')
        router.push('/admin')
      }

      if (res?.error) {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UI.Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="space-y-4">
          <UI.FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <UI.FormItem>
                <UI.FormLabel>E-mail</UI.FormLabel>
                <UI.FormControl>
                  <div className="relative">
                    <UI.Input {...field} type="email" id="email" className="pr-10" />
                    <AtSign className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                  </div>
                </UI.FormControl>
                <UI.FormMessage />
              </UI.FormItem>
            )}
          />

          <UI.FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <UI.FormItem>
                <UI.FormLabel>Password</UI.FormLabel>
                <UI.FormControl>
                  <div className="relative">
                    <UI.Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="pr-10"
                    />
                    <UI.Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full w-10 px-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <Eye className="text-muted-foreground h-4 w-4" />
                      )}
                    </UI.Button>
                  </div>
                </UI.FormControl>
                <UI.FormDescription>Min 8 symbols</UI.FormDescription>
                <UI.FormMessage />
              </UI.FormItem>
            )}
          />
        </div>

        <UI.Button type="submit" variant="outline" className="h-8 w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </UI.Button>
      </form>
    </UI.Form>
  )
}
