import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

interface VideoRecorderProps {
  maxDuration?: number; // seconds
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}

export function VideoRecorder({ maxDuration = 30, onComplete, onCancel }: VideoRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'review'>('idle');
  const [timeLeft, setTimeLeft] = useState(maxDuration);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 720, height: 1280 }, // Mobile portrait preferred
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      // Fallback UI would go here
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(blob);
        videoRef.current.controls = true;
        videoRef.current.play();
      }
    };

    mediaRecorder.start();
    setState('recording');

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('review');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const retake = () => {
    setVideoBlob(null);
    setTimeLeft(maxDuration);
    setState('idle');
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.controls = false;
      startCamera(); // Restart camera stream
    }
  };

  const save = () => {
    if (videoBlob) {
      onComplete(videoBlob);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden aspect-[9/16] shadow-2xl border-4 border-[#2A3038]">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={state !== 'review'} // Mute preview to avoid feedback loop
        className="w-full h-full object-cover"
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          {state === 'idle' && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-white bg-black/20 hover:bg-black/40 rounded-full">
              <X className="h-6 w-6" />
            </Button>
          )}
          {state === 'recording' && (
            <div className="bg-[#F4212E] text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              REC {Math.floor(maxDuration - timeLeft)}s
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center items-end pb-4 pointer-events-auto gap-8">
          {state === 'idle' && (
            <button 
              onClick={startRecording}
              className="w-20 h-20 bg-[#F4212E] rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
          )}

          {state === 'recording' && (
            <button 
              onClick={stopRecording}
              className="w-20 h-20 bg-transparent border-4 border-white rounded-full flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-[#F4212E] rounded" />
            </button>
          )}

          {state === 'review' && (
            <div className="flex gap-4 w-full">
              <Button onClick={retake} variant="secondary" className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                <RefreshCw className="h-4 w-4 mr-2" /> Retake
              </Button>
              <Button onClick={save} className="flex-1 bg-[#00D26A] hover:bg-[#00B85E] text-white">
                <Check className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
