"use client";

import { MotionValue, useMotionValueEvent } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type ImageSequenceCanvasProps = {
  progress: MotionValue<number>;
  frameCount: number;
  className?: string;
  objectFit?: "cover" | "contain" | "responsive";
};

const framePath = (index: number, extension: "webp" | "png" = "webp") =>
  `/frames/${index + 1}.${extension}`;

export function ImageSequenceCanvas({
  progress,
  frameCount,
  className = "",
  objectFit = "cover",
}: ImageSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.floor(width * dpr));
    const nextHeight = Math.max(1, Math.floor(height * dpr));

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
  }, []);

  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const image = imagesRef.current[index];
      if (!canvas || !image) return;

      resizeCanvas();
      const context = canvas.getContext("2d");
      if (!context) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = canvasWidth / canvasHeight;
      const shouldContain =
        objectFit === "contain" || (objectFit === "responsive" && window.innerWidth < 768);

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (shouldContain ? imageRatio > canvasRatio : imageRatio <= canvasRatio) {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imageRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imageRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    },
    [objectFit, resizeCanvas],
  );

  const requestDraw = useCallback(
    (index: number) => {
      currentFrameRef.current = index;
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        drawFrame(currentFrameRef.current);
      });
    },
    [drawFrame],
  );

  useEffect(() => {
    let isCancelled = false;
    let loaded = 0;
    const images = Array.from<HTMLImageElement>({ length: frameCount });

    const loadImage = (index: number) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          loaded += 1;
          if (!isCancelled) setLoadedCount(loaded);
          resolve(image);
        };
        image.onerror = () => {
          if (image.src.endsWith(".webp")) {
            image.src = framePath(index, "png");
            return;
          }

          reject(new Error(`Failed to load frame ${index + 1}`));
        };
        image.src = framePath(index);
      });

    const initialFrame = Math.round(progress.get() * (frameCount - 1));
    const preloadOrder = Array.from({ length: frameCount }, (_, index) => index).sort(
      (a, b) => Math.abs(a - initialFrame) - Math.abs(b - initialFrame),
    );

    loadImage(initialFrame)
      .then((image) => {
        if (isCancelled) return;
        images[initialFrame] = image;
        imagesRef.current = images;
        setIsLoaded(true);
        requestDraw(initialFrame);

        const remainingFrames = preloadOrder.filter((index) => index !== initialFrame);
        const loadNextFrames = async () => {
          const queue = [...remainingFrames];
          const workers = Array.from({ length: 6 }, async () => {
            while (queue.length > 0 && !isCancelled) {
              const index = queue.shift();
              if (index === undefined) return;

              try {
                const nextImage = await loadImage(index);
                if (isCancelled) return;
                images[index] = nextImage;
                imagesRef.current = images;
                if (currentFrameRef.current === index) requestDraw(index);
              } catch (error) {
                console.error(`Failed to preload reception frame ${index + 1}`, error);
              }
            }
          });

          await Promise.all(workers);
        };

        void loadNextFrames();
      })
      .catch((error) => {
        console.error("Failed to load initial reception frame", error);
      });

    return () => {
      isCancelled = true;
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [frameCount, progress, requestDraw]);

  useEffect(() => {
    const handleResize = () => requestDraw(currentFrameRef.current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [requestDraw]);

  useMotionValueEvent(progress, "change", (latest) => {
    if (!isLoaded) return;
    const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.round(latest * (frameCount - 1))));
    requestDraw(frameIndex);
  });

  const loadingPercentage = Math.round((loadedCount / frameCount) * 100);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#E6CCB9] ${className}`}>
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        role="img"
        aria-label="Scroll-controlled entrance into the LYKIA ATELIER reception"
      />
      {!isLoaded && (
        <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.28em] text-white/45">
          Loading {loadingPercentage}%
        </div>
      )}
    </div>
  );
}
