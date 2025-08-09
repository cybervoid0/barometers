import Link from 'next/link'
import { SignInForm } from './components/signin-form'

export default function SignIn() {
  return (
    <div className="flex justify-center">
      <div className="flex w-80 flex-col items-center space-y-6 py-4">
        <h2 className="text-2xl font-semibold leading-none">Sign In</h2>
        <SignInForm />
        <Link
          href="/register"
          className="text-sm text-muted-foreground hover:text-primary hover:underline"
        >
          Don&apos;t have an account?
        </Link>
      </div>
    </div>
  )
}
