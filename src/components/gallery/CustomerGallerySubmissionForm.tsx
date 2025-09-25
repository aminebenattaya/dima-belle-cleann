
// src/components/gallery/CustomerGallerySubmissionForm.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef, useState } from 'react';
import { submitGalleryPhotoAction } from '@/app/actions/galleryActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload, Image as ImageIcon, XCircle } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const initialState: { message: string; success: boolean; errors?: any } = {
  message: '',
  success: false,
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {(pending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Envoi en cours..." : "Soumettre mon Look"}
    </Button>
  );
}

export default function CustomerGallerySubmissionForm() {
  const [state, formAction] = useActionState(submitGalleryPhotoAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null); // Hidden field value

  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);

  useEffect(() => {
    setIsCameraSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Succès!' : 'Erreur de Soumission',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
        clearImage();
      }
    }
  }, [state, toast]);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreviewUrl(dataUrl);
        setImageDataUrl(dataUrl);
        setShowCamera(false);
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    if (!isCameraSupported) {
        setCameraError("La caméra n'est pas supportée sur cet appareil ou navigateur.");
        toast({
            variant: 'destructive',
            title: 'Caméra non supportée',
            description: "Veuillez utiliser un autre appareil ou navigateur.",
        });
        return;
    }
    setCameraError(null);
    setShowCamera(true);
    setImagePreviewUrl(null); // Clear previous preview
    setImageDataUrl(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setCameraError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
      toast({
        variant: 'destructive',
        title: 'Accès Caméra Refusé',
        description: 'Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.',
      });
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg'); // Or image/png
        setImagePreviewUrl(dataUrl);
        setImageDataUrl(dataUrl);
      }
      // Stop camera stream
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCamera(false);
    }
  };

  const clearImage = () => {
    setImagePreviewUrl(null);
    setImageDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4 py-4">
      <div>
        <Label htmlFor="customerName">Votre Nom</Label>
        <Input id="customerName" name="customerName" placeholder="Ex: Sarah L." required />
        {state?.errors?.customerName && <p className="text-sm text-destructive">{state.errors.customerName[0]}</p>}
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Votre Photo</Label>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
            <Upload className="mr-2 h-4 w-4" /> Choisir Fichier
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            name="imageFile" // Not directly used by formAction but good for clarity
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button type="button" variant="outline" onClick={startCamera} className="flex-1" disabled={!isCameraSupported}>
            <Camera className="mr-2 h-4 w-4" /> Prendre Photo
          </Button>
        </div>
        {state?.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>}
      </div>

      {/* Hidden input to store Data URL for submission */}
      {imageDataUrl && (
        <input type="hidden" name="imageUrl" value={imageDataUrl} />
      )}

      {cameraError && (
         <Alert variant="destructive">
            <AlertTitle>Erreur Caméra</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
      )}

      {showCamera && hasCameraPermission && (
        <div className="space-y-2">
          <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline muted />
          <Button type="button" onClick={capturePhoto} className="w-full">
            <Camera className="mr-2 h-4 w-4" /> Capturer
          </Button>
        </div>
      )}
      
      {/* Fallback if no camera permission and not showing camera, but it's needed */}
      { showCamera && hasCameraPermission === false && (
         <Alert variant="destructive">
            <AlertTitle>Accès Caméra Requis</AlertTitle>
            <AlertDescription>
              Veuillez autoriser l'accès à la caméra pour prendre une photo.
            </AlertDescription>
          </Alert>
      )}


      {imagePreviewUrl && (
        <div className="mt-4 space-y-2">
          <Label>Aperçu de l'image :</Label>
          <div className="relative group w-full aspect-square max-w-xs mx-auto border rounded-md overflow-hidden">
            <Image src={imagePreviewUrl} alt="Aperçu" layout="fill" objectFit="cover" />
            <Button 
              type="button" 
              variant="destructive" 
              size="icon" 
              className="absolute top-1 right-1 opacity-50 group-hover:opacity-100 transition-opacity"
              onClick={clearImage}
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Supprimer l'image</span>
            </Button>
          </div>
        </div>
      )}
      
      {!imagePreviewUrl && !showCamera && (
        <div className="mt-4 p-4 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card min-h-[100px] flex flex-col items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2"/>
            <p className="text-sm text-muted-foreground">Aucune image sélectionnée.</p>
            <p className="text-xs text-muted-foreground">Choisissez un fichier ou prenez une photo.</p>
        </div>
      )}


      {/* Canvas for capturing photo (hidden) */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div>
        <Label htmlFor="testimonial">Laissez un commentaire (optionnel)</Label>
        <Textarea 
            id="testimonial" 
            name="testimonial" 
            placeholder="Ex: J'adore mon nouveau foulard, la qualité est incroyable !" 
            rows={3} 
        />
        {state?.errors?.testimonial && <p className="text-sm text-destructive">{state.errors.testimonial[0]}</p>}
      </div>

      <div className="pt-2 space-y-2">
        <SubmitButton disabled={!imageDataUrl} /> 
          <DialogClose asChild>
            <Button variant="outline" className="w-full">Fermer</Button>
          </DialogClose>
      </div>
    </form>
  );
}
