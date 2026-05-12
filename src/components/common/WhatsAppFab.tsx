import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const REGIS_WHATSAPP = "573105551234"; // Regis Colombia support number

export function WhatsAppFab() {
  const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${REGIS_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          aria-label="Soporte por WhatsApp"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-elevated hover:bg-[#128C7E] z-50 print:hidden"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-64 mb-2">
        <DropdownMenuLabel className="text-xs">Contactar a Regis Colombia</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openWhatsApp("Hola, necesito ayuda con la plataforma SG-SST.")}>
          <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
          Soporte general
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openWhatsApp("Hola, tengo una consulta sobre la planilla PILA de mi empresa.")}>
          <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
          Consulta sobre PILA
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openWhatsApp("Hola, necesito enviar un examen medico ocupacional.")}>
          <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
          Enviar examen medico
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openWhatsApp("Hola, tengo una consulta sobre el cumplimiento del SG-SST de mi empresa.")}>
          <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
          Consulta cumplimiento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
