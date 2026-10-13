"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type UploadedFile = {
  file: File;
  id: string;
  previewUrl?: string;
};

type FileUploaderProps = {
  /** Accept attribute for the file input, e.g. "image/*" or ".pdf" */
  accept: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Called when files are added (with the new files only) */
  onFilesAdded?: (files: File[]) => void;
  /** Currently displayed files (controlled) */
  files: UploadedFile[];
  /** Called when a file is removed */
  onFileRemove?: (id: string) => void;
  /** Hint text shown under the dropzone */
  hint?: string;
  /** Disable the input while processing */
  disabled?: boolean;
};

/**
 * Drag-and-drop file uploader used by all tool components.
 *
 * Renders a stylized dropzone with a hidden <input type="file">. Files
 * are surfaced to the parent via onFilesAdded and rendered as chips with
 * remove buttons.
 */
export function FileUploader({
  accept,
  multiple = false,
  onFilesAdded,
  files,
  onFileRemove,
  hint,
  disabled = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0 && onFilesAdded) {
        onFilesAdded(multiple ? dropped : [dropped[0]]);
      }
    },
    [disabled, multiple, onFilesAdded]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length > 0 && onFilesAdded) {
      onFilesAdded(selected);
    }
    // Reset so the same file can be re-selected later
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <UploadCloud className="h-10 w-10 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-sm font-medium">
          Drop files here, or click to browse
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        disabled={disabled}
      />

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{f.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(f.file.size)}
                </p>
              </div>
              {!disabled && onFileRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Remove ${f.file.name}`}
                  onClick={() => onFileRemove(f.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
