"use client"

import type React from "react"

import { useEffect, useState } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import TeamDashboard from "@/components/team-dashboard"
import DriverDashboard from "@/components/driver-dashboard"
import DashboardHeader from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthStorage from "@/utils/auth"
import { ConstructorRacesReport, AirportReport, StatusReport, DriverWinsReport, PointsByYearReport } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState("")
  const [userType, setUserType] = useState<"admin" | "team" | "driver">("admin")

  useEffect(() => {
    const authData = AuthStorage.getAuth()
    // Verifica se os dados de autenticação existem
    if (authData && authData.user) {
      setUsername(authData.user.name || "Usuário")
      setUserId(authData.user.id || "")
      setUserType((authData.user as any).user_type as "admin" | "team" | "driver" || "admin")
    } else {
      // Redireciona para a página de login se não houver autenticação
      window.location.href = "/"
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <DashboardHeader userType={userType} username={username} userId={userId} />

      <div className="container mx-auto py-6 px-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {userType === "admin" && <AdminDashboard />}
            {userType === "team" && <TeamDashboard userName={username} />}
            {userType === "driver" && <DriverDashboard userName={username} />}
          </TabsContent>

          <TabsContent value="reports">
            {userType === "admin" && (
              <div className="grid gap-6">
                <h2 className="text-2xl font-bold">Relatórios do Administrador</h2>
                <AdminReports />
              </div>
            )}

            {userType === "team" && (
              <div className="grid gap-6">
                <h2 className="text-2xl font-bold">Relatórios da Escuderia</h2>
                <TeamReports />
              </div>
            )}

            {userType === "driver" && (
              <div className="grid gap-6">
                <h2 className="text-2xl font-bold">Relatórios do Piloto</h2>
                <DriverReports />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function AdminReports() {
  const { toast } = useToast()
  const [reportData, setReportData] = useState<ConstructorRacesReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [airportData, setAirportData] = useState<AirportReport[]>([])
  const [isLoadingAirports, setIsLoadingAirports] = useState(false)
  const [city, setCity] = useState("")
  const [statusData, setStatusData] = useState<StatusReport[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  const handleGenerateReport1 = async () => {
    try {
      setIsLoadingStatus(true)
      const response = await fetch("/api/reports/admin/status-results")
      const responseJson: {
        data: StatusReport[]
      } = await response.json()
      setStatusData(responseJson.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleGenerateReport2 = async () => {
    if (!city) {
      toast({
        title: "Erro",
        description: "Por favor, informe uma cidade",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoadingAirports(true)
      const response = await fetch(`/api/reports/admin/airports?city=${encodeURIComponent(city)}`)
      const responseJson: {
        data: AirportReport[]
      } = await response.json()
      console.log(responseJson.data)
      setAirportData(responseJson.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAirports(false)
    }
  }

  const handleGenerateReport3 = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/reports/admin/constructors-races")
      const responseJson: {
        data: ConstructorRacesReport[]
      } = await response.json()
      setReportData(responseJson.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleHideReport = () => {
    setReportData([])
  }

  const handleHideAirportReport = () => {
    setAirportData([])
  }

  const handleHideStatusReport = () => {
    setStatusData([])
  }
  
  return (
    <div className="grid gap-6">
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Relatório 1: Quantidade de resultados por status</h3>
        <p className="text-gray-600 mb-4">Indica a quantidade de resultados por cada status, apresentando o nome do status e sua contagem.</p>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport1} loading={isLoadingStatus}>Gerar Relatório</Button>
          {statusData?.length > 0 && (
            <Button onClick={handleHideStatusReport} variant="outline" loading={false}>Esconder Relatório</Button>
          )}
        </div>

        {statusData?.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusData.map((status, index) => (
                    <TableRow key={index}>
                      <TableCell>{status.status}</TableCell>
                      <TableCell>{status.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Relatório 2: Aeroportos próximos a cidades</h3>
        <p className="text-gray-600 mb-4">Apresenta aeroportos brasileiros a até 100 Km de uma cidade especificada.</p>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Digite o nome da cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleGenerateReport2} loading={isLoadingAirports}>Gerar Relatório</Button>
          {airportData?.length > 0 && (
            <Button onClick={handleHideAirportReport} variant="outline" loading={false}>Esconder Relatório</Button>
          )}
        </div>

        {airportData?.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aeroporto</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Código IATA</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Distância (km)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airportData.map((airport, index) => (
                    <TableRow key={index}>
                      <TableCell>{airport.name}</TableCell>
                      <TableCell>{airport.city}</TableCell>
                      <TableCell>{airport.iata}</TableCell>
                      <TableCell>{airport.type === 'medium_airport' ? 'Médio' : 'Grande'}</TableCell>
                      <TableCell>{airport.distance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Relatório 3: Escuderias e corridas</h3>
        <p className="text-gray-600 mb-4">Lista todas as escuderias cadastradas com a quantidade de pilotos e detalhes sobre corridas.</p>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport3} loading={isLoading}>Gerar Relatório</Button>
          {reportData?.length > 0 && (
            <Button onClick={handleHideReport} variant="outline" loading={false}>Esconder Relatório</Button>
          )}
        </div>

        {reportData?.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Relatório de Escuderias e Corridas</h2>
            {reportData.map((report) => (
              <div key={report.name} className="space-y-6 bg-white p-6 rounded-lg shadow">
                {/* Nível 1: Informações Gerais da Escuderia */}
                <div className="border-b pb-4">
                  <h3 className="text-xl font-semibold mb-4">{report.name}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Total de Pilotos</p>
                      <p className="text-2xl font-bold">{report.totalDrivers}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Total de Corridas</p>
                      <p className="text-2xl font-bold">{report.totalRaces}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Total de Vitórias</p>
                      <p className="text-2xl font-bold">{report.totalWins}</p>
                    </div>
                  </div>
                </div>

                {/* Nível 2: Informações por Circuito */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold">Informações por Circuito</h4>
                  {report.circuits.map((circuit) => (
                    <div key={circuit.name} className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded">
                        <h5 className="font-medium mb-2">{circuit.name}</h5>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total de Corridas</p>
                            <p className="font-semibold">{circuit.totalRaces}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Mínimo de Voltas</p>
                            <p className="font-semibold">{circuit.lapStats.min}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Média de Voltas</p>
                            <p className="font-semibold">{circuit.lapStats.avg}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Máximo de Voltas</p>
                            <p className="font-semibold">{circuit.lapStats.max}</p>
                          </div>
                        </div>
                      </div>

                      {/* Nível 3: Detalhes das Corridas */}
                      <div className="ml-4">
                        <h6 className="text-sm font-medium mb-2">Detalhes das Corridas</h6>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ano</TableHead>
                                <TableHead>Piloto</TableHead>
                                <TableHead>Voltas</TableHead>
                                <TableHead>Tempo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {circuit.races.map((race) => (
                                <TableRow key={`${race.year}-${race.driverName}`}>
                                  <TableCell>{race.year}</TableCell>
                                  <TableCell>{race.driverName}</TableCell>
                                  <TableCell>{race.laps}</TableCell>
                                  <TableCell>{race.time}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamReports() {
  const { toast } = useToast()
  const [driversData, setDriversData] = useState<DriverWinsReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusData, setStatusData] = useState<StatusReport[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  const handleGenerateReport4 = async () => {
    try {
      setIsLoading(true)
      const authData = AuthStorage.getAuth()
      if (!authData?.user?.constructor_id) {
        toast({
          title: "Erro",
          description: "ID da escuderia não encontrado",
          variant: "destructive",
        })
        return
      }
      const response = await fetch(`/api/reports/team/drivers-wins?constructorId=${authData.user.constructor_id}`)
      const responseJson: {
        data: DriverWinsReport[]
      } = await response.json()
      setDriversData(responseJson.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport5 = async () => {
    try {
      setIsLoadingStatus(true)
      const authData = AuthStorage.getAuth()
      if (!authData?.user?.constructor_id) {
        toast({
          title: "Erro",
          description: "ID da escuderia não encontrado",
          variant: "destructive",
        })
        return
      }
      const response = await fetch(`/api/reports/team/status-results?constructorId=${authData.user.constructor_id}`)
      const responseJson: {
        data: StatusReport[]
      } = await response.json()
      setStatusData(responseJson.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleHideReport = () => {
    setDriversData([])
  }

  const handleHideStatusReport = () => {
    setStatusData([])
  }

  return (
    <div className="grid gap-6">
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Relatório 4: Pilotos da escuderia</h3>
        <p className="text-gray-600 mb-4">Lista os pilotos da escuderia e a quantidade de vitórias de cada um.</p>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport4} loading={isLoading}>Gerar Relatório</Button>
          {driversData.length > 0 && (
            <Button onClick={handleHideReport} variant="outline" loading={false}>Esconder Relatório</Button>
          )}
        </div>

        {driversData.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Piloto</TableHead>
                    <TableHead>Vitórias</TableHead>
                    <TableHead>Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driversData.map((driver, index) => (
                    <TableRow key={index}>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>{driver.wins}</TableCell>
                      <TableCell>{driver.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Relatório 5: Resultados por status</h3>
        <p className="text-gray-600 mb-4">Lista a quantidade de resultados por cada status, limitadas ao escopo da escuderia.</p>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport5} loading={isLoadingStatus}>Gerar Relatório</Button>
          {statusData.length > 0 && (
            <Button onClick={handleHideStatusReport} variant="outline" loading={false}>Esconder Relatório</Button>
          )}
        </div>

        {statusData.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusData.map((status, index) => (
                    <TableRow key={index}>
                      <TableCell>{status.status}</TableCell>
                      <TableCell>{status.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DriverReports() {
  const { toast } = useToast()
  const [pointsData, setPointsData] = useState<PointsByYearReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusData, setStatusData] = useState<StatusReport[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  const handleGenerateReport6 = async () => {
    try {
      setIsLoading(true)
      const authData = AuthStorage.getAuth()
      if (!authData?.user?.driver_id) {
        toast({
          title: "Erro",
          description: "ID do piloto não encontrado",
          variant: "destructive",
        })
        return
      }
      const response = await fetch(`/api/reports/driver/points-by-year?driverId=${authData.user.driver_id}`)
      const responseJson: {
        data: PointsByYearReport[]
      } = await response.json()
      setPointsData(responseJson.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport7 = async () => {
    try {
      setIsLoadingStatus(true)
      const authData = AuthStorage.getAuth()
      if (!authData?.user?.driver_id) {
        toast({
          title: "Erro",
          description: "ID do piloto não encontrado",
          variant: "destructive",
        })
        return
      }
      const response = await fetch(`/api/reports/driver/status-results?driverId=${authData.user.driver_id}`)
      const responseJson: {
        data: StatusReport[]
      } = await response.json()
      setStatusData(responseJson.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleHideReport = () => {
    setPointsData([])
  }

  const handleHideStatusReport = () => {
    setStatusData([])
  }

  return (
    <div className="grid gap-6">
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Relatório 6: Pontos por ano</h3>
        <p className="text-gray-600 mb-4">Consulta a quantidade total de pontos obtidos por ano de participação na Fórmula 1, incluindo detalhes de cada corrida.</p>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport6} loading={isLoading}>Gerar Relatório</Button>
          {pointsData.length > 0 && (
            <Button onClick={handleHideReport} variant="outline" loading={false}>Esconder Relatório</Button>
          )}
        </div>

        {pointsData.length > 0 && (
          <div className="mt-6 space-y-6">
            {pointsData.map((yearData, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Ano {yearData.year}</h4>
                  <div className="text-sm text-gray-600">
                    Total de pontos: <span className="font-semibold">{yearData.points}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Corrida</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Posição</TableHead>
                        <TableHead>Pontos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearData.races.map((race, raceIndex) => (
                        <TableRow key={raceIndex}>
                          <TableCell>{race.name}</TableCell>
                          <TableCell>{new Date(race.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{race.position}º</TableCell>
                          <TableCell>{race.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">Relatório 7: Resultados por status</h3>
        <p className="text-gray-600 mb-4">Lista a quantidade de resultados por cada status nas corridas em que o piloto participou.</p>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport7} loading={isLoadingStatus}>Gerar Relatório</Button>
          {statusData.length > 0 && (
            <Button onClick={handleHideStatusReport} variant="outline" loading={false}>Esconder Relatório</Button>
          )}
        </div>

        {statusData.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusData.map((status, index) => (
                    <TableRow key={index}>
                      <TableCell>{status.status}</TableCell>
                      <TableCell>{status.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReportCard({ title, description, onClick }: { title: string; description: string; onClick?: () => void }) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button onClick={onClick} loading={false} variant="default">Gerar Relatório</Button>
    </div>
  )
}

function Button({ children, onClick, loading, variant = "default" }: { children: React.ReactNode; onClick?: () => void; loading: boolean; variant?: "default" | "outline" }) {
  const baseClasses = "px-4 py-2 rounded-md font-medium"
  const variantClasses = {
    default: "bg-[#e10600] hover:bg-[#b30500] text-white",
    outline: "border border-[#e10600] text-[#e10600] hover:bg-[#e10600] hover:text-white"
  }

  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${variantClasses[variant]}`} 
      disabled={loading}
    >
      {loading ? "Gerando..." : children}
    </button>
  )
}
