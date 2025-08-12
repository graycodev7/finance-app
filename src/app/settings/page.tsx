"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Bell, Download, Upload, Trash2, Globe, Settings, AlertTriangle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
// import { useTheme } from "next-themes" // Ya no se usa
import { useTransactions } from "@/components/transaction-provider"
import { useCSVExport } from "@/hooks/use-csv-export"
import { useCurrency, CURRENCIES } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { apiClient } from "@/lib/api"
// import { useAppearance } from "@/components/appearance-provider" // Reemplazado por useTheme

export default function SettingsPage() {
  const { toast } = useToast()
  const { transactions } = useTransactions()
  const { exportToCSV } = useCSVExport()
  const { currency, setCurrency } = useCurrency()
  const { user, updateUser } = useAuth()

  const [settings, setSettings] = useState({
    // Perfil
    name: "",
    email: "",
    currency: "USD",
    language: "es",

    // Notificaciones
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    budgetAlerts: true,

    // Apariencia
    compactMode: false,
  })

  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)

  // Cargar datos del usuario autenticado y sus preferencias
  useEffect(() => {
    const loadUserData = async () => {
      // Solo cargar datos si es la primera vez o si explícitamente no hemos cargado datos iniciales
      if (user && !isLoadingPreferences && !hasLoadedInitialData) {
        setIsLoadingPreferences(true)
        try {
          // Pequeño delay para asegurar que el token esté disponible
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Cargar perfil del usuario
          const profileResponse = await apiClient.getProfile()
          
          if (profileResponse.success && profileResponse.data?.user) {
            const userData = profileResponse.data.user

            
            const newSettings = {
              name: userData.name || "",
              email: userData.email || "",
              currency: userData.currency || "USD",
              language: userData.language || "es",
              emailNotifications: userData.email_notifications ?? true,
              pushNotifications: userData.push_notifications ?? false,
              weeklyReports: userData.weekly_reports ?? true,
              budgetAlerts: userData.budget_alerts ?? true,
              compactMode: false,
            }
            

            setSettings(newSettings)
            
            // También actualizar la moneda en el contexto
            const userCurrency = CURRENCIES.find(c => c.code === userData.currency)
            if (userCurrency && userData.currency !== currency.code) {
              setCurrency(userCurrency)
            }
            
            setHasLoadedInitialData(true)
          } else {

            // Fallback a datos del contexto si falla la API
            setSettings(prev => ({
              ...prev,
              name: user.name || "",
              email: user.email || "",
            }))
            setHasLoadedInitialData(true)
          }
        } catch (error) {

          // Fallback a datos del contexto si hay error (token expirado, etc.)
          setSettings(prev => ({
            ...prev,
            name: user.name || "",
            email: user.email || "",
          }))
          setHasLoadedInitialData(true)
        } finally {
          setIsLoadingPreferences(false)
        }
      }
    }

    // Solo ejecutar si realmente tenemos un usuario autenticado Y no hemos cargado datos iniciales
    if (user && !hasLoadedInitialData) {
      loadUserData()
    }
  }, [user, hasLoadedInitialData])

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    try {

      
      // Preparar datos del perfil (nombre y email)
      const profileData = {
        name: settings.name,
        email: settings.email,
      }

      // Preparar datos de preferencias
      const preferencesData = {
        currency: settings.currency,
        language: settings.language,
        email_notifications: settings.emailNotifications,
        push_notifications: settings.pushNotifications,
        weekly_reports: settings.weeklyReports,
        budget_alerts: settings.budgetAlerts,
      }



      // Actualizar perfil y preferencias por separado
      const [profileResponse, preferencesResponse] = await Promise.all([
        apiClient.updateProfile(profileData),
        apiClient.updatePreferences(preferencesData)
      ])



      if (profileResponse.success && preferencesResponse.success) {
        // Actualizar el contexto de usuario con TODOS los nuevos datos
        updateUser({
          name: settings.name,
          email: settings.email,
          currency: settings.currency,
          language: settings.language,
          email_notifications: settings.emailNotifications,
          push_notifications: settings.pushNotifications,
          weekly_reports: settings.weeklyReports,
          budget_alerts: settings.budgetAlerts,
        })

        toast({
          title: "Configuración guardada",
          description: "Tu perfil y preferencias han sido actualizados correctamente",
        })
        
        // Actualizar la moneda en el contexto global si cambió
        const newCurrency = CURRENCIES.find(c => c.code === settings.currency)
        if (newCurrency && settings.currency !== currency.code) {
          setCurrency(newCurrency)
        }


      } else {
        throw new Error('Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    const csvHeaders = ["Fecha", "Tipo", "Descripción", "Categoría", "Monto", "Notas", "Fecha de Creación"]
    const csvData = transactions.map((t) => [
      t.date,
      t.type === "income" ? "Ingreso" : "Gasto",
      t.description,
      t.category,
      t.amount.toString(),
      t.notes || "",
      t.createdAt,
    ])

    exportToCSV({
      filename: `backup_transacciones_${new Date().toISOString().split("T")[0]}.csv`,
      headers: csvHeaders,
      data: csvData,
    })
  }

  const handleImportData = () => {
    toast({
      title: "Importar datos",
      description: "Funcionalidad de importación próximamente",
    })
  }

  const handleDeleteAllTransactions = () => {
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteAllTransactions = async () => {
    try {
      // Delete from backend
      const response = await apiClient.deleteAllTransactions()
      
      if (response.success) {
        // Also clear from localStorage if exists
        localStorage.removeItem("financial-transactions")
        
        // Refresh transactions in the context
        window.location.reload()
        
        toast({
          title: "Transacciones eliminadas",
          description: "Todas las transacciones han sido eliminadas exitosamente.",
          variant: "destructive",
        })
      } else {
        throw new Error(response.message || 'Error al eliminar transacciones')
      }
    } catch (error) {
      console.error('Error deleting transactions:', error)
      toast({
        title: "Error",
        description: "No se pudieron eliminar las transacciones. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-5 main-content pt-16 md:pt-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen responsive-container">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Configuración
        </h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2 h-auto p-1">
          <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-2">Perfil</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-2">Notific.</TabsTrigger>
          <TabsTrigger value="data" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-2">Datos</TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <div className="responsive-card glass-card p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-black shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Información Personal</h3>
                <p className="text-sm text-slate-600">Actualiza tu información personal y preferencias de cuenta</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={settings.name}
                    onChange={(e) => handleSettingChange("name", e.target.value)}
                    className="form-input-fixed border-0 bg-white backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange("email", e.target.value)}
                    className="form-input-fixed border-0 bg-white backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="h-px bg-slate-200/50 my-6"></div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-slate-700 font-medium">Moneda predeterminada</Label>
                  <Select value={settings.currency} onValueChange={(value) => {
                    handleSettingChange("currency", value);
                    const selectedCurrency = CURRENCIES.find(c => c.code === value);
                    if (selectedCurrency) {
                      setCurrency(selectedCurrency);
                    }
                  }}>
                    <SelectTrigger id="currency" name="currency" className="form-input-fixed border-0 bg-white/80 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">🇺🇸 Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                      <SelectItem value="PEN">🇵🇪 Sol Peruano (PEN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-slate-700 font-medium">Idioma</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger id="language" name="language" className="form-input-fixed border-0 bg-white/80 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="pt">🇧🇷 Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="responsive-card glass-card p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Preferencias de Notificación</h3>
                <p className="text-sm text-slate-600">Configura cómo y cuándo quieres recibir notificaciones</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-slate-50/80 rounded-2xl">
                <div className="space-y-1">
                  <Label htmlFor="emailNotifications" className="text-slate-700 font-medium">Notificaciones por email</Label>
                  <p className="text-sm text-slate-500">Recibe actualizaciones importantes por correo</p>
                </div>
                <Switch
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-slate-50/80 rounded-2xl">
                <div className="space-y-1">
                  <Label htmlFor="pushNotifications" className="text-slate-700 font-medium">Notificaciones push</Label>
                  <p className="text-sm text-slate-500">Recibe notificaciones en tiempo real</p>
                </div>
                <Switch
                  id="pushNotifications"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-slate-50/80 rounded-2xl">
                <div className="space-y-1">
                  <Label htmlFor="weeklyReports" className="text-slate-700 font-medium">Reportes semanales</Label>
                  <p className="text-sm text-slate-500">Resumen semanal de tus finanzas</p>
                </div>
                <Switch
                  id="weeklyReports"
                  name="weeklyReports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-slate-50/80 rounded-2xl">
                <div className="space-y-1">
                  <Label htmlFor="budgetAlerts" className="text-slate-700 font-medium">Alertas de presupuesto</Label>
                  <p className="text-sm text-slate-500">Te avisamos cuando te acerques a tu límite</p>
                </div>
                <Switch
                  id="budgetAlerts"
                  name="budgetAlerts"
                  checked={settings.budgetAlerts}
                  onCheckedChange={(checked) => handleSettingChange("budgetAlerts", checked)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Sección de apariencia/tema eliminada completamente */}



        {/* Datos */}
        <TabsContent value="data" className="space-y-6">
          <div className="responsive-card glass-card p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Gestión de Datos</h3>
                <p className="text-sm text-slate-600">Importa, exporta o elimina tus datos</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <Button 
                  onClick={handleExportData} 
                  variant="outline" 
                  className="h-24 flex-col bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-8 w-8 mb-2 text-teal-600" />
                  <span className="font-semibold">Exportar Datos</span>
                  <span className="text-xs text-muted-foreground">
                    Descargar en CSV ({transactions.length} transacciones)
                  </span>
                </Button>

                <Button 
                  onClick={handleImportData} 
                  variant="outline" 
                  className="h-24 flex-col bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl"
                >
                  <Upload className="h-8 w-8 mb-2 text-blue-600" />
                  <span className="font-semibold">Importar Datos</span>
                  <span className="text-xs text-muted-foreground">Desde archivo CSV</span>
                </Button>
              </div>

              <div className="h-px bg-slate-200/50 my-6"></div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-red-200/50">
                  <Label className="text-red-700 font-semibold text-lg">Zona de Peligro</Label>
                  <p className="text-sm text-red-600 mt-2 mb-4">Estas acciones son irreversibles. Procede con cuidado.</p>
                  <Button 
                    variant="destructive" 
                    className="w-full border-0 shadow-lg hover:shadow-xl" 
                    onClick={handleDeleteAllTransactions}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Todas las Transacciones
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botón de guardar */}
      <div className="flex justify-center sm:justify-end w-full">
        <Button 
          onClick={handleSave} 
          size="lg"
          className="border-0 shadow-lg hover:shadow-xl bg-black text-white hover:bg-gray-800"
        >
          <Settings className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>

      {/* Modal de confirmación para eliminar datos */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Esta acción eliminará permanentemente todas tus transacciones.
            </DialogDescription>
            <div className="text-sm text-slate-600 mt-2">
              Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Todas las transacciones de ingresos</li>
                <li>Todas las transacciones de gastos</li>
                <li>Historial de transacciones</li>
              </ul>
              <p className="mt-2 text-sm text-slate-500">
                <strong>Nota:</strong> Tus configuraciones personales, categorías y datos de perfil se mantendrán intactos.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteAllTransactions}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sí, eliminar transacciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}