import LoginForm from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15151e]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            <Image src="/f1-logo.png" alt="Fórmula 1 Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-3xl font-bold text-white">Sistema F1 - FIA</h1>
          <p className="text-gray-400 mt-2">Gerenciamento de dados da Fórmula 1</p>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
