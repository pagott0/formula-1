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

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Escuderia cadastrada",
      description: "A escuderia foi cadastrada com sucesso.",
    })
    setOpenTeam(false)
  }

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
                <Input id="constructorRef" placeholder="ex: alpine" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="ex: Alpine F1 Team" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidade</Label>
                <Input id="nationality" placeholder="ex: French" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" placeholder="ex: http://en.wikipedia.org/wiki/Alpine_F1_Team" required />
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
