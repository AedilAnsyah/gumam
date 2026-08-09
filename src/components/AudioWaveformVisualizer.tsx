import React, { useEffect, useRef } from 'react';

interface AudioWaveformVisualizerProps {
  mediaStream: MediaStream | null;
  isRecording: boolean;
  className?: string;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  mediaStream,
  isRecording,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !mediaStream || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');

      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim() || '#3B828E';

      const draw = () => {
        if (!canvasCtx || !canvas) return;

        animationFrameRef.current = requestAnimationFrame(draw);
        analyser!.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = Math.max((dataArray[i] / 255) * canvas.height * 0.85, 6);

          canvasCtx.fillStyle = accentColor;
          
          const y = (canvas.height - barHeight) / 2;
          canvasCtx.beginPath();
          if (canvasCtx.roundRect) {
            canvasCtx.roundRect(x, y, Math.max(barWidth - 2, 3), barHeight, 4);
          } else {
            canvasCtx.rect(x, y, Math.max(barWidth - 2, 3), barHeight);
          }
          canvasCtx.fill();

          x += barWidth + 3;
        }
      };

      draw();
    } catch (err) {
      console.error('AudioContext Waveform Visualizer Error:', err);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    };
  }, [isRecording, mediaStream]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={64}
      className={`w-full max-w-[280px] h-16 ${className}`}
    />
  );
};
