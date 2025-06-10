"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulação de login - em um cenário real, isso seria uma chamada à API
    setTimeout(() => {
      setIsLoading(false)

      // Verificação simplificada para demonstração
      if (username === "admin" && password === "admin") {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo, Administrador!",
        })
        router.push("/dashboard?userType=admin")
      } else if (username.endsWith("_c")) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo à sua escuderia!",
        })
        router.push("/dashboard?userType=team")
      } else if (username.endsWith("_d")) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo, Piloto!",
        })
        router.push("/dashboard?userType=driver")
      } else {
        toast({
          title: "Erro de autenticação",
          description: "Usuário ou senha incorretos",
          variant: "destructive",
        })
      }
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nome de usuário</Label>
        <Input
          id="username"
          placeholder="Seu nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="pt-2">
        <Button type="submit" className="w-full bg-[#e10600] hover:bg-[#b30500]" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
      <div className="text-sm text-center text-gray-500 mt-4">
        <p>Formatos de login:</p>
        <p>Admin: admin / admin</p>
        <p>Escuderia: escuderia_c / escuderia</p>
        <p>Piloto: piloto_d / piloto</p>
      </div>
    </form>
  )
}
