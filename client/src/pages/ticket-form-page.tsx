import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EnhancedTicketForm from "@/components/tickets/enhanced-ticket-form";

export default function TicketFormPage() {
  const [, setLocation] = useLocation();
  const [formOpen, setFormOpen] = useState(true);

  const handleFormClose = (open: boolean) => {
    if (!open) {
      setLocation('/tickets');
    }
    setFormOpen(open);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/tickets')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Novo Ticket</h1>
      </div>

      <EnhancedTicketForm 
        open={formOpen} 
        onOpenChange={handleFormClose}
      />
    </div>
  );
}