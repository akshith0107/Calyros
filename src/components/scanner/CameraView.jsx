import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../Button';

export default function CameraView({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setError("Camera access denied or unavailable. Please use the upload option.");
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Extract base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Stop tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    onCapture(imageData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onCapture(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="scanner-camera-view absolute inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-white text-lg font-medium tracking-wide">Scan Nutrition Label</h2>
        <button onClick={onCancel} className="text-white/60 hover:text-white p-2 rounded-full backdrop-blur-md bg-white/10 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      {/* Camera Feed */}
      <div className="relative flex-1 overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="text-center p-8 max-w-sm">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-white/80">{error}</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Guide Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
              {/* Semi-transparent mask around the target area */}
              <div className="absolute inset-0 bg-black/40 mix-blend-hard-light mask-frame"></div>
              
              <div className="relative w-3/4 max-w-sm aspect-[3/4] border-2 border-white/30 rounded-2xl overflow-hidden">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                
                {/* Animated scan line */}
                <motion.div 
                  className="absolute left-0 right-0 h-[2px] bg-white/50 shadow-[0_0_15px_3px_rgba(255,255,255,0.4)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                />
              </div>
              <p className="mt-8 text-white/90 text-sm tracking-wide font-medium backdrop-blur-md bg-black/40 px-4 py-2 rounded-full">
                Align nutrition label within frame
              </p>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black pb-12 pt-8 px-6 flex flex-col items-center gap-6 z-20">
        <div className="flex items-center justify-center gap-12 w-full max-w-sm">
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/jpeg, image/png, image/webp" 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-white/60 hover:text-white p-4 transition-colors flex flex-col items-center gap-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span className="text-xs tracking-wider uppercase">Upload</span>
          </button>

          {/* Shutter Button */}
          <button 
            onClick={handleCapture}
            disabled={!!error}
            className={`w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center p-1 transition-transform active:scale-95 ${error ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/50'}`}
          >
            <div className="w-full h-full bg-white rounded-full"></div>
          </button>

          <div className="w-16"></div> {/* Spacer for symmetry */}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
