"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Trophy, Users, Calendar, Flag } from "lucide-react"
import AdminActions from "@/components/admin-actions"

// Dados simulados para o dashboard
const raceData = [
  { name: "GP da Austrália", laps: 58, time: "1:32:01.892" },
  { name: "GP da Arábia Saudita", laps: 50, time: "1:21:14.894" },
  { name: "GP do Bahrein", laps: 57, time: "1:33:56.736" },
  { name: "GP da China", laps: 56, time: "1:27:38.241" },
  { name: "GP de Miami", laps: 57, time: "1:34:24.258" },
]

const teamData = [
  { name: "Red Bull Racing", points: 287 },
  { name: "Ferrari", points: 265 },
  { name: "McLaren", points: 174 },
  { name: "Mercedes", points: 151 },
  { name: "Aston Martin", points: 49 },
]

const driverData = [
  { name: "Max Verstappen", points: 195 },
  { name: "Charles Leclerc", points: 148 },
  { name: "Sergio Perez", points: 126 },
  { name: "Lando Norris", points: 116 },
  { name: "Carlos Sainz", points: 116 },
]

const chartData = [
  { name: "Austrália", RedBull: 44, Ferrari: 43, McLaren: 27, Mercedes: 16 },
  { name: "Arábia Saudita", RedBull: 43, Ferrari: 40, McLaren: 12, Mercedes: 27 },
  { name: "Bahrein", RedBull: 31, Ferrari: 38, McLaren: 18, Mercedes: 16 },
  { name: "China", RedBull: 25, Ferrari: 36, McLaren: 33, Mercedes: 22 },
  { name: "Miami", RedBull: 37, Ferrari: 33, McLaren: 25, Mercedes: 18 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pilotos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Pilotos ativos e inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escuderias</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">Escuderias ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Temporadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74</div>
            <p className="text-xs text-muted-foreground">Desde 1950</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corridas em 2024</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">5 já realizadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pontuação por Corrida (2024)</CardTitle>
            <CardDescription>Distribuição de pontos entre as principais equipes</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="RedBull" fill="#3671C6" />
                  <Bar dataKey="Ferrari" fill="#F91536" />
                  <Bar dataKey="McLaren" fill="#F58020" />
                  <Bar dataKey="Mercedes" fill="#6CD3BF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
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
          <TabsTrigger value="races">Corridas (2024)</TabsTrigger>
          <TabsTrigger value="teams">Escuderias (2024)</TabsTrigger>
          <TabsTrigger value="drivers">Pilotos (2024)</TabsTrigger>
        </TabsList>
        <TabsContent value="races" className="p-4 border rounded-md mt-2 bg-white">
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
                    <td className="p-2">{race.time}</td>
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
    </div>
  )
}
