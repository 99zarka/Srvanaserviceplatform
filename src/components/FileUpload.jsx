import { useState } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export function FileUpload({
  label,
  name,
  fileName,
  onFileChange,
  onFileRemove,
  error,
  required = false,
  accept,
  isUploading = false,
  className,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileSelected = !!fileName;

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileChange({
        target: {
          name,
          files,
        },
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div
        className={cn(
          "group relative mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pb-6 pt-5",
          "transition-colors duration-200 ease-in-out",
          {
            "border-destructive": error,
            "border-border": !error && !isDragOver,
            "border-primary": isDragOver,
            "bg-muted/50": fileSelected && !error,
            "hover:border-primary/50": !fileSelected,
          }
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
              <span className="mt-2 text-sm text-muted-foreground">جارٍ الرفع...</span>
            </div>
          ) : fileSelected ? (
            <div className="flex flex-col items-center">
              <File className="mx-auto h-12 w-12 text-primary" />
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium text-primary">{fileName}</span>
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="flex text-sm text-muted-foreground">
                <label
                  htmlFor={name}
                  className="relative cursor-pointer rounded-md bg-transparent font-medium text-primary transition-colors hover:text-primary/80 focus-within:outline-none"
                >
                  <span>ارفع ملفًا</span>
                  <input
                    id={name}
                    name={name}
                    type="file"
                    className="sr-only"
                    onChange={onFileChange}
                    accept={accept}
                    disabled={isUploading}
                  />
                </label>
                <p className="pl-1">أو اسحبه وأفلته</p>
              </div>
              <p className="text-xs text-muted-foreground">
                (ملفات الصور و PDF، بحد أقصى 10MB)
              </p>
            </>
          )}
        </div>
        {fileSelected && !isUploading && (
          <button
            type="button"
            onClick={onFileRemove}
            className={cn(
              "absolute right-2 top-2 rounded-full p-1.5 text-destructive/70 transition-colors",
              "bg-background/50 backdrop-blur-sm",
              "hover:bg-destructive/10 hover:text-destructive",
              "opacity-0 group-hover:opacity-100"
            )}
            aria-label="Remove file"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
