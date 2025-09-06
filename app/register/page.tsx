'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { AtSign, Eye, EyeOff, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as yup from 'yup'
import { register } from '@/actions/register'
import * as UI from '@/components/ui'

const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name should be 2-50 symbols long')
    .max(50, 'Name should be 2-50 symbols long'),
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Should be at least 6 symbols long'),
  repeatPassword: yup
    .string()
    .required('Please repeat password')
    .oneOf([yup.ref('password')], 'Passwords are not identical'),
})

type RegisterFormData = yup.InferType<typeof registerSchema>

export default function Register() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      repeatPassword: '',
    },
  })

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true)
    try {
      await register(values)
      toast.success(`${values.name} was successfully registered`)
      router.push('/signin')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article className="flex justify-center">
      <UI.FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="w-80 space-y-4">
            <h2 className="mb-2 text-center text-2xl">Registration</h2>

            <UI.FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>Name</UI.FormLabel>
                  <UI.FormControl>
                    <div className="relative">
                      <UI.Input {...field} className="pr-10" />
                      <User className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                    </div>
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />

            <UI.FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>E-mail</UI.FormLabel>
                  <UI.FormControl>
                    <div className="relative">
                      <UI.Input {...field} type="email" className="pr-10" />
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

            <UI.FormField
              control={form.control}
              name="repeatPassword"
              render={({ field }) => (
                <UI.FormItem>
                  <UI.FormLabel>Repeat password</UI.FormLabel>
                  <UI.FormControl>
                    <div className="relative">
                      <UI.Input
                        {...field}
                        type={showRepeatPassword ? 'text' : 'password'}
                        className="pr-10"
                      />
                      <UI.Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full w-10 px-0 hover:bg-transparent"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRepeatPassword ? (
                          <EyeOff className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <Eye className="text-muted-foreground h-4 w-4" />
                        )}
                      </UI.Button>
                    </div>
                  </UI.FormControl>
                  <UI.FormMessage />
                </UI.FormItem>
              )}
            />
          </div>

          <UI.Button type="submit" variant="outline" className="h-8 w-full" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign up'}
          </UI.Button>
        </form>
      </UI.FormProvider>
    </article>
  )
}
