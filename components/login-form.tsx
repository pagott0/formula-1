"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import AuthStorage from "@/utils/auth"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Login bem-sucedido",
          description: data.message || "Bem-vindo!",
        })
        const authData = {
          token: data.token,
          user: data.user,
          expiresAt: Date.now() + 3600 * 1000, // 1 hora
          userType: data.user.user_type,
        }
        AuthStorage.setAuth(authData)
        router.push(`/dashboard`)
      } else {
        toast({
          title: "Erro de autenticação",
          description: data.message || "Usuário ou senha incorretos",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Entrando...
            </div>
          ) : (
            "Entrar"
          )}
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
