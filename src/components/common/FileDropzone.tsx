import { UploadCloud } from "lucide-react";
import { useRef, useState, DragEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  onFiles: (files: File[]) => void;
  accept?: string;
  hint?: string;
  className?: string;
};

export function FileDropzone({ onFiles, accept, hint = "PDF, XLSX o ZIP — máx. 25MB", className }: Props) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      className={cn(
        "w-full rounded-lg border-2 border-dashed border-border bg-muted/30 p-10 text-center transition-colors",
        "hover:border-primary/50 hover:bg-muted/50",
        over && "border-primary bg-primary/5",
        className,
      )}
    >
      <UploadCloud className="mx-auto h-10 w-10 text-primary mb-3" />
      <p className="text-sm font-medium text-foreground">Arrastra archivos aquí o haz clic para seleccionar</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </button>
  );
}
