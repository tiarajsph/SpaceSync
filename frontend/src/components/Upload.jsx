import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function UploadOverlay({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      setError("");
      return;
    }

    if (selected.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }

    setFile(selected);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a PDF to upload.");
      return;
    }

    if (onUpload) {
      setIsLoading(true);
      setError("");
      try {
        await onUpload(file);
      } catch (err) {
        setError(err.message || "Upload failed. Please try again.");
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose();
      }}
    >
      <DialogContent className="w-[95vw] max-w-md border border-[var(--color-blue)]/40 bg-[var(--color-navy)] text-[var(--color-light)] shadow-xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-[var(--color-light)]">
            Upload Timetable (PDF)
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--color-light)]/70">
            Select a PDF file containing the latest timetable. This will be used
            to improve room availability predictions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[var(--color-navy)]/95 backdrop-blur-sm rounded-lg z-10 flex flex-col items-center justify-center gap-4">
              <div className="loader"></div>
              <p className="text-xs sm:text-sm text-[var(--color-light)] font-medium">
                Parsing timetable with AI...
              </p>
            </div>
          )}
          <div className="border-2 border-dashed border-[var(--color-blue)]/60 rounded-lg p-3 sm:p-4 bg-[var(--color-dark)]/40 flex flex-col items-center text-center">
            <label className="block text-xs sm:text-sm font-medium mb-2 text-[var(--color-light)]">
              Choose PDF file
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="block w-full max-w-xs mx-auto text-xs sm:text-sm text-[var(--color-light)] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-[var(--color-blue)]/60 file:bg-[var(--color-dark)] file:text-[var(--color-light)] hover:file:bg-[var(--color-blue)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {error && (
              <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>
            )}

            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="border-[var(--color-blue)]/60 text-[var(--color-light)] hover:bg-[var(--color-blue)]/15 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isLoading}
                className="bg-[var(--color-blue)] text-[var(--color-dark)] hover:bg-[var(--color-blue)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UploadOverlay;