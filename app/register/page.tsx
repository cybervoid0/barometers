'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { AtSign, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { register } from '@/actions/register'

interface RegisterFormData {
  name: string
  email: string
  password: string
  repeatPassword: string
}

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
    <div className="flex justify-center">
      <Form {...form}>
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
                      <Input {...field} id="name" className="pr-10" />
                      <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                      <Input {...field} type="email" id="email" className="pr-10" />
                      <AtSign className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                        id="password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10 px-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
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
                        id="repeat-password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10 px-0 hover:bg-transparent"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRepeatPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" variant="outline" className="h-8 w-full" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
