"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Flag, Calendar } from "lucide-react"
import type { DriverStats, CareerYear, CircuitPerformance } from "@/lib/types"
import Loading from "./loading"
import AuthStorage from "@/utils/auth"

export default function DriverDashboard({ userName }: { userName: string }) {
  const [stats, setStats] = useState<DriverStats | null>(null)
  const [career, setCareer] = useState<CareerYear[]>([])
  const [circuits, setCircuits] = useState<CircuitPerformance[]>([])
  const [pointsByYear, setPointsByYear] = useState<{ year: number; points: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Em um cenário real, o driverId viria da autenticação
        const user = AuthStorage.getUser()
        const driverId = user?.driver_id || ""
        const response = await fetch(`/api/dashboard/driver?driverId=${driverId}`)
        const data = await response.json()

        setStats(data.stats)
        setCareer(data.career)
        setCircuits(data.circuits)
        setPointsByYear(data.pointsByYear)
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-8">
      {loading 
      ?
        <Loading />
      :
        <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vitórias</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWins || 0}</div>
            <p className="text-xs text-muted-foreground">Na carreira</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Corridas</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRaces || 0}</div>
            <p className="text-xs text-muted-foreground">Participações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período na F1</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.period || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Temporadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="career">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="career">Carreira por Ano</TabsTrigger>
          <TabsTrigger value="circuits">Desempenho por Circuito</TabsTrigger>
        </TabsList>
        <TabsContent value="career" className="p-4 border rounded-md mt-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ano</th>
                  <th className="text-left p-2">Pontos</th>
                  <th className="text-left p-2">Vitórias</th>
                  <th className="text-left p-2">Corridas</th>
                </tr>
              </thead>
              <tbody>
                {career.map((year, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{year.year}</td>
                    <td className="p-2">{year.points}</td>
                    <td className="p-2">{year.wins}</td>
                    <td className="p-2">{year.races}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="circuits" className="p-4 border rounded-md mt-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Circuito</th>
                  <th className="text-left p-2">Vitórias</th>
                  <th className="text-left p-2">Corridas</th>
                  <th className="text-left p-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {circuits.map((circuit, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{circuit.circuit}</td>
                    <td className="p-2">{circuit.wins}</td>
                    <td className="p-2">{circuit.races}</td>
                    <td className="p-2">{circuit.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      </>
      }
    </div>
  )
}
