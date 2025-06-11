"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Trophy, Users, Calendar } from "lucide-react"
import TeamActions from "@/components/team-actions"
import type { TeamStats, TeamDriver, YearResult, StatusResult } from "@/lib/types"
import AuthStorage from "@/utils/auth"
import Loading from "@/components/loading"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function TeamDashboard({ userName }: { userName: string }) {
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [drivers, setDrivers] = useState<TeamDriver[]>([])
  const [results, setResults] = useState<YearResult[]>([])
  const [statusData, setStatusData] = useState<StatusResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/team?constructorName=${AuthStorage.getConstructorName()}`)
        const data = await response.json()
        console.log(data)

        setStats(data.stats)
        setDrivers(data.drivers)
        setResults(data.yearResults)
        setStatusData(data.status)
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
      {
        loading ? (
          <Loading />
        ) : (
          <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vitórias</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWins || 0}</div>
            <p className="text-xs text-muted-foreground">Desde {stats?.period?.slice(0, 4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pilotos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDrivers || 0}</div>
            <p className="text-xs text-muted-foreground">Ao longo da história</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período na F1</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.period || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Anos de história</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Corridas</CardTitle>
            <CardDescription>Distribuição de resultados nas últimas corridas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ações da Escuderia</CardTitle>
            <CardDescription>Gerencie pilotos e consulte informações</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamActions userName={userName} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="drivers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drivers">Pilotos da Escuderia</TabsTrigger>
          <TabsTrigger value="results">Resultados por Ano</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers" className="p-4 border rounded-md mt-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome do Piloto</th>
                  <th className="text-left p-2">Corridas</th>
                  <th className="text-left p-2">Vitórias</th>
                  <th className="text-left p-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {drivers?.map((driver, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{driver.name}</td>
                    <td className="p-2">{driver.races}</td>
                    <td className="p-2">{driver.wins}</td>
                    <td className="p-2">{driver.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="results" className="p-4 border rounded-md mt-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ano</th>
                  <th className="text-left p-2">Vitórias</th>
                  <th className="text-left p-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {results?.map((result, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{result.year}</td>
                    <td className="p-2">{result.wins}</td>
                    <td className="p-2">{result.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      </>
        )
      }
    </div>
  )
}
