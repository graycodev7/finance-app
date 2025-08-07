import { useToast } from "./use-toast"

interface CSVExportOptions {
  filename?: string
  headers: string[]
  data: (string | number)[][]
}

export function useCSVExport() {
  const { toast } = useToast()

  const exportToCSV = ({ filename, headers, data }: CSVExportOptions) => {
    if (data.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "No se encontraron datos para exportar",
        variant: "destructive",
      })
      return
    }

    const csvContent = [
      headers.join(","), 
      ...data.map((row) => row.map((field) => `"${field}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename || `export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Archivo descargado",
      description: `Se descargaron ${data.length} registros en formato CSV`,
    })
  }

  return { exportToCSV }
} 