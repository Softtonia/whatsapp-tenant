"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useImportContactsMutation } from "../hooks";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ContactImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactImportModal({ isOpen, onClose }: ContactImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; failed: number; skipped: number } | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportContactsMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith(".csv")) {
        setErrorMsg("Please upload a valid .csv file");
        return;
      }
      setFile(selected);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "name,phone,email,company,tags,source\n" +
      "Aarav Sharma,+919811122233,aarav.sharma@acme.com,Acme Industries,Enterprise;High Value,Website\n" +
      "Priya Patel,+919822233344,priya@example.com,Nexus Logistics,Support,Inbound\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "whatsapp_contacts_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setErrorMsg(null);
      const formData = new FormData();
      formData.append("file", file);
      const res = await importMutation.mutateAsync(formData);
      setResult(res);
      setFile(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to import contacts");
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Import Contacts via CSV
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Bulk upload verified phone numbers and opt-in contacts into your WhatsApp CRM directory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {result ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
              <CheckCircle2 className="size-8 text-primary mx-auto" />
              <h4 className="text-sm font-bold text-foreground">Import Complete</h4>
              <p className="text-xs text-muted-foreground">
                Successfully processed contacts from your file.
              </p>
              <div className="flex justify-center gap-4 text-xs font-semibold pt-2">
                <span className="text-primary">{result.imported} Imported</span>
                {result.skipped > 0 && (
                  <span className="text-muted-foreground">{result.skipped} Skipped</span>
                )}
                {result.failed > 0 && (
                  <span className="text-destructive">{result.failed} Failed</span>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-muted/10 hover:bg-muted/20"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div className="size-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <FileSpreadsheet className="size-5" />
                </div>
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-foreground">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Click to choose CSV file
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Max file size 5MB (UTF-8 encoded)
                    </p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Template Download & Formatting Help */}
              <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">CSV Column Format</span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Download className="size-3" />
                    Download Sample
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Required: <code className="text-foreground font-mono">name</code>,{" "}
                  <code className="text-foreground font-mono">phone</code> (with +country code).
                  Optional: <code className="text-foreground font-mono">email</code>,{" "}
                  <code className="text-foreground font-mono">company</code>,{" "}
                  <code className="text-foreground font-mono">tags</code> (semicolon separated),{" "}
                  <code className="text-foreground font-mono">source</code>.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          {result ? (
            <Button size="sm" onClick={handleClose} className="w-full">
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!file || importMutation.isPending}
                onClick={handleUpload}
                className="gap-1.5"
              >
                {importMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                <span>Import Contacts</span>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

