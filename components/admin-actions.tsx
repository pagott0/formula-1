"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AdminActions() {
  const { toast } = useToast()
  const [openTeam, setOpenTeam] = useState(false)
  const [openDriver, setOpenDriver] = useState(false)
  
  // Add state management for team form fields
  const [constructorRef, setConstructorRef] = useState("")
  const [name, setName] = useState("")
  const [nationality, setNationality] = useState("")
  const [url, setUrl] = useState("")

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/actions/admin/create-constructor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          constructorRef,
          name,
          nationality,
          url,
        }),
      })

      console.log(response)

      if (!response.ok) {
        throw new Error("Failed to create team")
      }

      toast({
        title: "Escuderia cadastrada",
        description: "A escuderia foi cadastrada com sucesso.",
      })
      setOpenTeam(false)
      
      // Reset form fields
      setConstructorRef("")
      setName("")
      setNationality("")
      setUrl("")
    } catch (error) {
      toast({
        title: "Erro ao cadastrar escuderia",
        description: "Ocorreu um erro ao cadastrar a escuderia. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/actions/admin/create-driver", {
      method: "POST",
      body: JSON.stringify({
        driverRef: "piastri",
        number: 81,
      }),
    })
    toast({
      title: "Piloto cadastrado",
      description: "O piloto foi cadastrado com sucesso.",
    })
    setOpenDriver(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Gerenciamento de Escuderias e Pilotos</h3>
        <p className="text-sm text-muted-foreground">Cadastre novas escuderias e pilotos no sistema</p>
      </div>

      <div className="flex flex-col gap-3">
        <Dialog open={openTeam} onOpenChange={setOpenTeam}>
          <DialogTrigger asChild>
            <Button className="w-full bg-[#e10600] hover:bg-[#b30500]">Cadastrar Escuderia</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Escuderia</DialogTitle>
              <DialogDescription>Preencha os dados da nova escuderia</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTeamSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="constructorRef">Constructor Ref</Label>
                <Input 
                  id="constructorRef" 
                  placeholder="ex: alpine" 
                  required 
                  value={constructorRef}
                  onChange={(e) => setConstructorRef(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="ex: Alpine F1 Team" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidade</Label>
                <Input 
                  id="nationality" 
                  placeholder="ex: French" 
                  required 
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  placeholder="ex: http://en.wikipedia.org/wiki/Alpine_F1_Team" 
                  required 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#e10600] hover:bg-[#b30500]">
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={openDriver} onOpenChange={setOpenDriver}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Cadastrar Piloto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Piloto</DialogTitle>
              <DialogDescription>Preencha os dados do novo piloto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDriverSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="driverRef">Driver Ref</Label>
                <Input id="driverRef" placeholder="ex: piastri" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" placeholder="ex: 81" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input id="code" placeholder="ex: PIA" maxLength={3} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="forename">Nome</Label>
                  <Input id="forename" placeholder="ex: Oscar" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Sobrenome</Label>
                  <Input id="surname" placeholder="ex: Piastri" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Data de Nascimento</Label>
                <Input id="dob" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidade</Label>
                <Input id="nationality" placeholder="ex: Australian" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#e10600] hover:bg-[#b30500]">
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
