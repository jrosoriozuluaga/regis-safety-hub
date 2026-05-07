import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileDropzone } from "@/components/common/FileDropzone";

export default function Pila() {
  const [open, setOpen] = useState(false);

  const handleFiles = async (files: File[]) => {
    toast.success(`Archivo "${files[0].name}" recibido — procesamiento pendiente (n8n)`);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Gestión PILA"
        description="Planilla Integrada de Liquidación de Aportes — control mensual por empresa."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Upload className="h-4 w-4" /> Cargar PILA</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cargar planilla PILA</DialogTitle>
                <DialogDescription>Arrastra el archivo de la planilla mensual.</DialogDescription>
              </DialogHeader>
              <FileDropzone onFiles={handleFiles} accept=".pdf,.xlsx,.xls,.zip" />
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="shadow-card">
        <CardContent className="p-8 text-center text-muted-foreground">
          Módulo PILA — se conectará al workflow de n8n para procesamiento automático.
        </CardContent>
      </Card>
    </div>
  );
}
