import { SignUpForm } from "@/components/signup-form"

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </main>
  )
}
