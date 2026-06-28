"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type PdfViewerProps = {
  src: string;
  title: string;
};

const EMBED_CHECK_DELAY_MS = 2500;

export function PdfViewer({ src, title }: PdfViewerProps) {
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const checkEmbedBlocked = useCallback(
    (iframe: HTMLIFrameElement) => {
      try {
        const doc = iframe.contentDocument;
        if (doc && doc.body && doc.body.childElementCount === 0) {
          setEmbedBlocked(true);
        }
      } catch {
        // Cross-origin: cannot inspect content; assume embed works or user will use fallback.
      }
    },
    [],
  );

  useEffect(() => {
    setEmbedBlocked(false);
    setIframeLoaded(false);
  }, [src]);

  useEffect(() => {
    if (!iframeLoaded || embedBlocked) {
      return;
    }

    const timer = window.setTimeout(() => {
      const iframe = document.getElementById(
        `pdf-iframe-${encodeURIComponent(src)}`,
      ) as HTMLIFrameElement | null;

      if (iframe) {
        checkEmbedBlocked(iframe);
      }
    }, EMBED_CHECK_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [checkEmbedBlocked, embedBlocked, iframeLoaded, src]);

  return (
    <div className="space-y-4">
      {embedBlocked ? (
        <Alert>
          <AlertTitle>Affichage intégré impossible</AlertTitle>
          <AlertDescription>
            Ce PDF ne peut pas être affiché directement dans la page (l&apos;hébergeur
            bloque l&apos;intégration). Utilisez le bouton ci-dessous pour l&apos;ouvrir
            dans un nouvel onglet.
          </AlertDescription>
        </Alert>
      ) : (
        <iframe
          id={`pdf-iframe-${encodeURIComponent(src)}`}
          src={src}
          title={title}
          className="aspect-[4/3] w-full rounded-lg border border-border/60 bg-muted shadow-soft"
          onLoad={(event) => {
            setIframeLoaded(true);
            checkEmbedBlocked(event.currentTarget);
          }}
        />
      )}

      {!embedBlocked ? (
        <p className="text-xs text-muted-foreground">
          Si le document reste vide, l&apos;hébergeur peut bloquer l&apos;affichage
          intégré — ouvrez-le dans un nouvel onglet.
        </p>
      ) : null}

      <Button
        variant="outline"
        render={
          <a href={src} target="_blank" rel="noopener noreferrer" />
        }
      >
        <ExternalLinkIcon />
        Ouvrir le PDF dans un nouvel onglet
      </Button>
    </div>
  );
}
