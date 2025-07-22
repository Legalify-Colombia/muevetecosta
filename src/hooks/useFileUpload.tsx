
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadProps {
  bucket: string;
  folder?: string;
}

export const useFileUpload = ({ bucket, folder }: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, fileName?: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `${Date.now()}-${file.name}`;
      const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

      console.log('Uploading file to bucket:', bucket, 'path:', filePath);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Error al cargar archivo",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      // Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log('File uploaded successfully, public URL:', publicUrl);

      toast({
        title: "Archivo cargado",
        description: "El archivo se ha cargado correctamente"
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar el archivo",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      // Extraer el path relativo de la URL si es necesario
      const pathToDelete = filePath.includes('/storage/v1/object/public/') 
        ? filePath.split(`/storage/v1/object/public/${bucket}/`)[1]
        : filePath;

      console.log('Deleting file from bucket:', bucket, 'path:', pathToDelete);

      const { error } = await supabase.storage
        .from(bucket)
        .remove([pathToDelete]);

      if (error) {
        console.error('Error deleting file:', error);
        toast({
          title: "Error al eliminar archivo",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente"
      });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el archivo",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading
  };
};
