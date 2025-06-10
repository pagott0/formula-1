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
import type { SearchDriverResponse } from "@/lib/types"

export default function TeamActions() {
  const { toast } = useToast()
  const [openSearch, setOpenSearch] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [searchResults, setSearchResults] = useState<SearchDriverResponse["drivers"]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    try {
      const response = await fetch(`/api/actions/team/search-driver?name=${encodeURIComponent(searchName)}`)
      const data = (await response.json()) as SearchDriverResponse

      setSearchResults(data.drivers)

      if (data.drivers.length === 0) {
        toast({
          title: "Nenhum piloto encontrado",
          description: "Tente outro nome ou termo de busca.",
        })
      } else {
        toast({
          title: "Pilotos encontrados",
          description: `Foram encontrados ${data.drivers.length} pilotos.`,
        })
      }
    } catch (error) {
      console.error("Erro ao buscar pilotos:", error)
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar pilotos.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      // Em um cenário real, o constructorId viria da autenticação
      formData.append("constructorId", "1") // McLaren

      const response = await fetch("/api/actions/team/import-drivers", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Pilotos importados",
          description: data.message,
        })
        setOpenImport(false)
      } else {
        toast({
          title: "Erro na importação",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao importar pilotos:", error)
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os pilotos.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Gerenciamento de Pilotos</h3>
        <p className="text-sm text-muted-foreground">Consulte e importe pilotos para sua escuderia</p>
      </div>

      <div className="flex flex-col gap-3">
        <Dialog open={openSearch} onOpenChange={setOpenSearch}>
          <DialogTrigger asChild>
            <Button className="w-full bg-[#F58020] hover:bg-[#D36D1C]">Consultar por Nome</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Consultar Piloto por Nome</DialogTitle>
              <DialogDescription>Digite o nome do piloto para buscar</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSearch} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Piloto</Label>
                <Input
                  id="name"
                  placeholder="ex: Lewis"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#F58020] hover:bg-[#D36D1C]" disabled={isSearching}>
                  {isSearching ? "Buscando..." : "Buscar"}
                </Button>
              </DialogFooter>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Resultados da busca:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Nacionalidade</th>
                        <th className="text-left p-2">Data de Nascimento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((driver) => (
                        <tr key={driver.id} className="border-b">
                          <td className="p-2">{driver.name}</td>
                          <td className="p-2">{driver.nationality}</td>
                          <td className="p-2">{driver.dob}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={openImport} onOpenChange={setOpenImport}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Importar Pilotos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar Pilotos de Arquivo</DialogTitle>
              <DialogDescription>Selecione um arquivo com dados dos pilotos</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleImport} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo de Pilotos</Label>
                <Input id="file" type="file" accept=".csv,.txt" onChange={handleFileChange} required />
                <p className="text-xs text-muted-foreground mt-1">
                  O arquivo deve conter uma linha por piloto com os campos: driverRef, number, code, forename, surname,
                  dob, nationality
                </p>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#F58020] hover:bg-[#D36D1C]" disabled={isImporting}>
                  {isImporting ? "Importando..." : "Importar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
