import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};
