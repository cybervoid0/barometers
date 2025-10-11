'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, Eye, EyeOff, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Button,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
} from '@/components/ui'
import { register } from '@/server/register/actions'

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name should be 2-50 symbols long')
      .max(50, 'Name should be 2-50 symbols long'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(1, 'Password is required').min(6, 'Should be at least 6 symbols long'),
    repeatPassword: z.string().min(1, 'Please repeat password'),
  })
  .refine(data => data.password === data.repeatPassword, {
    message: 'Passwords are not identical',
    path: ['repeatPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      repeatPassword: '',
    },
  })

  const onSubmit = async (values: RegisterFormData) => {
    startTransition(async () => {
      try {
        await register(values)
        toast.success(`${values.name} was successfully registered`)
        router.push('/signin')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Registration error')
      }
    })
  }

  return (
    <article className="flex justify-center">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="w-80 space-y-4">
            <h2 className="mb-2 text-center text-2xl">Registration</h2>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} className="pr-10" />
                      <User className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type="email" className="pr-10" />
                      <AtSign className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                      />
                      <Button
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
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>Min 8 symbols</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeatPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showRepeatPassword ? 'text' : 'password'}
                        className="pr-10"
                      />
                      <Button
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
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" variant="outline" className="h-8 w-full" disabled={isPending}>
            {isPending ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>
      </FormProvider>
    </article>
  )
}
