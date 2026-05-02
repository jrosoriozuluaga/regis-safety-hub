import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FileDropzone } from "@/components/common/FileDropzone";
import { pilaService } from "@/services";
import type { PilaRecord } from "@/types/domain";

export default function Pila() {
  const [rows, setRows] = useState<PilaRecord[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { pilaService.list().then(setRows); }, []);

  const handleFiles = async (files: File[]) => {
    await pilaService.upload(files[0]);
    toast.success(`Archivo "${files[0].name}" cargado correctamente`);
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Mes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Cargado el</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.companyName}</TableCell>
                  <TableCell>{r.month}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right text-muted-foreground">{r.uploadedAt ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
