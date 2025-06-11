"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Trophy, Users, Calendar, Flag } from "lucide-react"
import Loading from "@/components/loading"
import AdminActions from "@/components/admin-actions"

export default function AdminDashboard() {
  const [raceData, setRaceData] = useState<Array<{ name: string; laps: number | null; time: string | { minutes: number; seconds: number; milliseconds: number }; date: Date; circuit: string }>>([])
  const [teamData, setTeamData] = useState<Array<{ name: string; points: number }>>([])
  const [driverData, setDriverData] = useState<Array<{ name: string; points: number }>>([])
  const [chartData, setChartData] = useState<Array<{ name: string; RedBull: number; Ferrari: number; McLaren: number; Mercedes: number }>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalDrivers: number;
    totalConstructors: number;
    totalSeasons: number;
    currentYearRaces: number;
    completedRaces: number;
  }>({
    totalDrivers: 0,
    totalConstructors: 0,
    totalSeasons: 0,
    currentYearRaces: 0,
    completedRaces: 0,
  })
  // const today = new Date().getFullYear()
  const today = '2024' // Hardcoded for demo purposes, replace with new Date().getFullYear() in production

  useEffect(() => {
    fetch('/api/dashboard/admin')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data)
        setStats(data.stats)
        setRaceData(data.races)
        setTeamData(data.constructors)
        setDriverData(data.drivers)
        setChartData(data.racePoints)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      })
  }, [])

  return (
    <div className="space-y-8">
      {loading ? 
        <Loading />
      : (
        <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pilotos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrivers}</div>
            <p className="text-xs text-muted-foreground">Pilotos ativos e inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escuderias</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConstructors}</div>
            <p className="text-xs text-muted-foreground">Escuderias ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Temporadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSeasons}</div>
            <p className="text-xs text-muted-foreground">Desde 1950</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corridas em {today}</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentYearRaces}</div>
            <p className="text-xs text-muted-foreground">Corridas programadas para este ano</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Ações do Administrador</CardTitle>
            <CardDescription>Gerencie escuderias e pilotos</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminActions />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="races">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="races">Corridas ({today})</TabsTrigger>
          <TabsTrigger value="teams">Escuderias ({today})</TabsTrigger>
          <TabsTrigger value="drivers">Pilotos ({today})</TabsTrigger>
        </TabsList>
        <TabsContent value="races" className="p-2 border rounded-md mt-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nome da Corrida</th>
                    <th className="text-left p-2">Total de Voltas</th>
                    <th className="text-left p-2">Tempo Total</th>
                  </tr>
                  </thead>
                  <tbody>
                  {raceData.map((race, index) => (
                    <tr key={index} className="border-b">
                    <td className="p-2">{race.name}</td>
                    <td className="p-2">{race.laps}</td>
                    <td className="p-2">
                      {typeof race.time === 'string' 
                      ? race.time 
                      : `${race.time.minutes}:${race.time.seconds.toString().padStart(2, '0')}.${race.time.milliseconds.toString().padStart(3, '0')}`
                      }
                    </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="teams" className="p-4 border rounded-md mt-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Escuderia</th>
                  <th className="text-left p-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map((team, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{team.name}</td>
                    <td className="p-2">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="drivers" className="p-4 border rounded-md mt-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Piloto</th>
                  <th className="text-left p-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {driverData.map((driver, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{driver.name}</td>
                    <td className="p-2">{driver.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      </>
      )}
    </div>
  )
}
