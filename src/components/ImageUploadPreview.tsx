"use client";
import { useState, useEffect } from "react";

interface ImageUploadPreviewProps {
  name: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageUploadPreview({ name, accept = "image/*", multiple = false, className, style }: ImageUploadPreviewProps) {
  const [previews, setPreviews] = useState<{ url: string, isVideo: boolean }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews: { url: string, isVideo: boolean }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newPreviews.push({
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/")
      });
    }
    setPreviews(newPreviews);
  };

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input 
        type="file" 
        name={name} 
        accept={accept} 
        multiple={multiple} 
        className={className} 
        style={style} 
        onChange={handleFileChange} 
      />
      
      {previews.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {previews.map((preview, idx) => (
            <div key={idx} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
              {preview.isVideo ? (
                <video src={preview.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
              ) : (
                <img src={preview.url} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
