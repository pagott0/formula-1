"use client"

import type React from "react"

import { useEffect, useState } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import TeamDashboard from "@/components/team-dashboard"
import DriverDashboard from "@/components/driver-dashboard"
import DashboardHeader from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthStorage from "@/utils/auth"

export default function DashboardPage() {
  const [username, setUsername] = useState("")
  const [userType, setUserType] = useState<"admin" | "team" | "driver">("admin")

  useEffect(() => {
    const authData = AuthStorage.getAuth()
    // Verifica se os dados de autenticação existem
    if (authData && authData.user) {
      setUsername(authData.user.name || "Usuário")
      setUserType((authData.user as any).user_type as "admin" | "team" | "driver" || "admin")
    } else {
      // Redireciona para a página de login se não houver autenticação
      window.location.href = "/"
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <DashboardHeader userType={userType} username={username} />

      <div className="container mx-auto py-6 px-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {userType === "admin" && <AdminDashboard />}
            {userType === "team" && <TeamDashboard />}
            {userType === "driver" && <DriverDashboard />}
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
  return (
    <div className="grid gap-6">
      <ReportCard
        title="Relatório 1: Quantidade de resultados por status"
        description="Indica a quantidade de resultados por cada status, apresentando o nome do status e sua contagem."
      />
      <ReportCard
        title="Relatório 2: Aeroportos próximos a cidades"
        description="Apresenta aeroportos brasileiros a até 100 Km de uma cidade especificada."
      />
      <ReportCard
        title="Relatório 3: Escuderias e corridas"
        description="Lista todas as escuderias cadastradas com a quantidade de pilotos e detalhes sobre corridas."
      />
    </div>
  )
}

function TeamReports() {
  return (
    <div className="grid gap-6">
      <ReportCard
        title="Relatório 4: Pilotos da escuderia"
        description="Lista os pilotos da escuderia e a quantidade de vitórias de cada um."
      />
      <ReportCard
        title="Relatório 5: Resultados por status"
        description="Lista a quantidade de resultados por cada status, limitadas ao escopo da escuderia."
      />
    </div>
  )
}

function DriverReports() {
  return (
    <div className="grid gap-6">
      <ReportCard
        title="Relatório 6: Pontos por ano"
        description="Consulta a quantidade total de pontos obtidos por ano de participação na Fórmula 1."
      />
      <ReportCard
        title="Relatório 7: Resultados por status"
        description="Lista a quantidade de resultados por cada status nas corridas em que o piloto participou."
      />
    </div>
  )
}

function ReportCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button>Gerar Relatório</Button>
    </div>
  )
}

function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-[#e10600] hover:bg-[#b30500] text-white px-4 py-2 rounded-md font-medium">
      {children}
    </button>
  )
}
