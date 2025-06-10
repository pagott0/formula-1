import { LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  userType: string
  username: string
  userId: string
}

export default function DashboardHeader({ userType, username, userId}: DashboardHeaderProps) {
  const getUserInfo = () => {
    switch (userType) {
      case "admin":
        return {
          name: "Administrador",
          description: "Acesso completo ao sistema",
          initials: "AD",
          userId,
        }
      case "team":
        return {
          name: username,
          description: "Escuderia",
          initials: username.charAt(0).toUpperCase() + username.charAt(1).toUpperCase(),
          userId
        }
      case "driver":
        return {
          name: username,
          description: "Piloto",
          initials: username.charAt(0).toUpperCase() + username.charAt(1).toUpperCase(),
          userId
        }
      default:
        return {
          name: "Usuário",
          description: "Acesso limitado",
          initials: "US",
          userId
        }
    }
  }

  const userInfo = getUserInfo()

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10">
            <img src="/f1-logo.png" alt="F1 Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Sistema F1 - FIA</h1>
            <p className="text-xs text-gray-500">Gerenciamento de dados</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-[#e10600] text-white">{userInfo.initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="font-medium">{userInfo.name}</p>
              <p className="text-xs text-gray-500">{userInfo.description}</p>
            </div>
          </div>

          <Link href="/">
            <Button variant="outline" size="icon">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
