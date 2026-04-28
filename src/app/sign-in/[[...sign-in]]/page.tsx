import { LoginForm } from "@/components/login-form"

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
