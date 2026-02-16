"use client";

import { useState } from "react";
import { experimental_useObject } from "ai/react";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import {
  FileUp,
  Plus,
  Loader2,
  ShieldCheck,
  Building2,
  ClipboardCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Quiz from "@/components/quiz";
import { AnimatePresence, motion } from "framer-motion";

export default function ChatWithFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    [],
  );
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState<string>();

  const { submit, object: partialQuestions, isLoading } = experimental_useObject(
    {
      api: "/api/generate-quiz",
      schema: questionsSchema,
      initialValue: undefined,
      onError: (error) => {
        console.error("useObject onError:", error);
        toast.error("Failed to generate quiz. Please try again.");
        setFiles([]);
      },
      onFinish: ({ object, error }) => {
        console.log("useObject onFinish:", { object, error });
        setQuestions(object ?? []);
      },
    },
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker.",
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      })),
    );

    submit({ files: encodedFiles });

    // Optional: set a more “internal training” default title
    // setTitle(`Security Awareness Training`);
  };

  const clearPDF = () => {
    setFiles([]);
    setQuestions([]);
  };

  const progress = partialQuestions ? (partialQuestions.length / 6) * 100 : 0;

  // When quiz is ready, render your existing quiz component
  if (questions.length === 6) {
    return (
      <Quiz
        title={title ?? "Internal Training Quiz"}
        questions={questions}
        clearPDF={clearPDF}
      />
    );
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center bg-background"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="font-medium">Drop the training PDF to upload</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              (PDF only • max 5MB)
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl px-4 pb-10">
        {/* Top “internal portal” banner */}
        <div className="mt-10 mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border p-3 bg-muted/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold leading-tight">
                  Company Training Portal
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-muted/30 text-muted-foreground">
                  Internal Use Only
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a training/policy PDF to generate a short knowledge check.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure training workflow</span>
          </div>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3">
              {/* Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                  <div className="h-6 w-6 rounded-full border flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <span className="text-sm">Upload PDF</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                  <div className="h-6 w-6 rounded-full border flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <span className="text-sm">Generate Quiz</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                  <div className="h-6 w-6 rounded-full border flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <span className="text-sm">Complete Training</span>
                </div>
              </div>

              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">
                  Knowledge Check Generator
                </CardTitle>
                <CardDescription className="text-sm">
                  Use an approved internal policy or training document (PDF) to
                  generate a 4-question quiz for employees.
                </CardDescription>
              </div>
            </div>

            {/* Internal guidance box */}
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Upload rules</p>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                    <li>PDF only, maximum size 5MB</li>
                    <li>
                      Use internal training content (e.g., HR policy, security
                      awareness, acceptable use)
                    </li>
                    <li>
                      Don’t upload confidential customer data or private personal
                      records
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmitWithFiles} className="space-y-4">
              <div
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 transition-colors hover:border-muted-foreground/50 bg-muted/10"
                aria-label="PDF upload dropzone"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <div className="flex items-center justify-center gap-2 mb-2 text-muted-foreground">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileUp className="h-5 w-5" />
                  </div>
                  <Plus className="h-4 w-4" />
                  <div className="rounded-full bg-primary/10 p-2">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  {files.length > 0 ? (
                    <>
                      Selected:{" "}
                      <span className="font-medium text-foreground">
                        {files[0].name}
                      </span>
                    </>
                  ) : (
                    <span>Drag & drop your training PDF here, or click to browse.</span>
                  )}
                </p>

                {files.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Ready to generate a 4-question knowledge check.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={files.length === 0}>
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating training quiz…</span>
                  </span>
                ) : (
                  "Generate Knowledge Check"
                )}
              </Button>
            </form>
          </CardContent>

          {isLoading && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Generation status</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="w-full space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50 animate-pulse" />
                  <span className="text-muted-foreground">
                    {partialQuestions
                      ? `Preparing question ${partialQuestions.length + 1} of 4`
                      : "Reviewing document content…"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Please keep this tab open until the quiz loads.
                </p>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Internal footer */}
        <div className="mt-6 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Training content is for employee education purposes.</span>
          </div>
          <span>© {new Date().getFullYear()} Internal Learning</span>
        </div>
      </div>
    </div>
  );
}