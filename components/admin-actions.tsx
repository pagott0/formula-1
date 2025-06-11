"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { toast } from "react-toastify"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminActions() {
  const [openTeam, setOpenTeam] = useState(false)
  const [openDriver, setOpenDriver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [constructors, setConstructors] = useState<{ id: number; name: string }[]>([])
  const [selectedConstructor, setSelectedConstructor] = useState<string>("")
  const [year, setYear] = useState<string>(new Date().getFullYear().toString())
  
  // Add state management for team form fields
  const [constructorRef, setConstructorRef] = useState("")
  const [name, setName] = useState("")
  const [nationality, setNationality] = useState("")
  const [url, setUrl] = useState("")

  // Add state management for driver form fields
  const [driverRef, setDriverRef] = useState("")
  const [driverNumber, setDriverNumber] = useState("")
  const [driverCode, setDriverCode] = useState("")
  const [forename, setForename] = useState("")
  const [surname, setSurname] = useState("")
  const [dob, setDob] = useState("")
  const [driverNationality, setDriverNationality] = useState("")

  useEffect(() => {
    const fetchConstructors = async () => {
      try {
        const response = await fetch("/api/actions/admin/get-constructors")
        const data = await response.json()
        if (data.constructors) {
          setConstructors(data.constructors)
        }
      } catch (error) {
        console.error("Error fetching constructors:", error)
        toast.error("Erro ao carregar escuderias")
      }
    }

    fetchConstructors()
  }, [])

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
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


      if (!response.ok) {
        if (response.status === 400) {
          toast.error("Escuderia já existe")
        } else {
          toast.error("Erro ao cadastrar escuderia")
        }
        setIsLoading(false)
        return
      }

      if(response.status === 200) {
        toast.success("Escuderia cadastrada com sucesso")
        setOpenTeam(false)
        
        // Reset form fields
        setConstructorRef("")
        setName("")
        setNationality("")
        setUrl("")
        setIsLoading(false)
      } else if(response.status === 400) {
        toast.error("Escuderia já existe")
        setIsLoading(false)
      } else {
        toast.error("Erro ao cadastrar escuderia")
        setIsLoading(false)
      }

    
      
    } catch (error) {
      toast.error("Erro ao cadastrar escuderia")
      setIsLoading(false)
    }
  }

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch("/api/actions/admin/create-driver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverRef,
          number: parseInt(driverNumber),
          code: driverCode,
          forename,
          surname,
          dob,
          nationality: driverNationality,
          constructorId: selectedConstructor,
          year: parseInt(year),
        }),
      })

      if (!response.ok) {
        if (response.status === 400) {
          toast.error("Piloto já existe")
        } else {
          toast.error("Erro ao cadastrar piloto")
        }
        setIsLoading(false)
        return
      }

      if(response.status === 200) {
        toast.success("Piloto cadastrado com sucesso")
        setOpenDriver(false)
        
        // Reset form fields
        setDriverRef("")
        setDriverNumber("")
        setDriverCode("")
        setForename("")
        setSurname("")
        setDob("")
        setDriverNationality("")
        setSelectedConstructor("")
        setYear(new Date().getFullYear().toString())
        setIsLoading(false)
      } else if(response.status === 400) {
        toast.error("Piloto já existe")
        setIsLoading(false)
      } else {
        toast.error("Erro ao cadastrar piloto")
        setIsLoading(false)
      }
    } catch (error) {
      toast.error("Erro ao cadastrar piloto")
      setIsLoading(false)
    }
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
                <Button loading={isLoading} disabled={isLoading} type="submit" className="bg-[#e10600] hover:bg-[#b30500]">
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
                <Input 
                  id="driverRef" 
                  placeholder="ex: piastri" 
                  required 
                  value={driverRef}
                  onChange={(e) => setDriverRef(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input 
                    id="number" 
                    placeholder="ex: 81" 
                    type="number" 
                    required 
                    value={driverNumber}
                    onChange={(e) => setDriverNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input 
                    id="code" 
                    placeholder="ex: PIA" 
                    maxLength={3} 
                    required 
                    value={driverCode}
                    onChange={(e) => setDriverCode(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="forename">Nome</Label>
                  <Input 
                    id="forename" 
                    placeholder="ex: Oscar" 
                    required 
                    value={forename}
                    onChange={(e) => setForename(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Sobrenome</Label>
                  <Input 
                    id="surname" 
                    placeholder="ex: Piastri" 
                    required 
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Data de Nascimento</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    required 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidade</Label>
                  <Input 
                    id="nationality" 
                    placeholder="ex: Australian" 
                    required 
                    value={driverNationality}
                    onChange={(e) => setDriverNationality(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="constructor">Escuderia</Label>
                <Select
                  value={selectedConstructor}
                  onValueChange={setSelectedConstructor}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma escuderia" />
                  </SelectTrigger>
                  <SelectContent>
                    {constructors.map((constructor) => (
                      <SelectItem key={constructor.id} value={constructor.id.toString()}>
                        {constructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Input 
                  id="year" 
                  type="number" 
                  min="1950"
                  max={new Date().getFullYear()}
                  required 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button loading={isLoading} disabled={isLoading} type="submit" className="bg-[#e10600] hover:bg-[#b30500]">
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
