import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppFab() {
  return (
    <Button
      size="icon"
      aria-label="Soporte por WhatsApp"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-success text-success-foreground shadow-elevated hover:bg-success/90"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
