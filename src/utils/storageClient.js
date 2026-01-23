import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

// Inicializar cliente S3 compatible con Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_KEY,
  },
});

export const getFileMetadata = async (path) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: import.meta.env.VITE_R2_BUCKET,
      Key: path,
    });
    const response = await s3Client.send(command);
    return { size: response.ContentLength };
  } catch (err) {
    console.warn("Error obteniendo metadata de R2:", err);
    return null;
  }
};

export const uploadFileToR2 = async (file, path) => {
  try {
    // CORRECCIÓN: Convertimos el archivo a Buffer (binario) para evitar el error de Stream
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: import.meta.env.VITE_R2_BUCKET,
      Key: path,
      Body: fileBuffer, // Enviamos el buffer, no el objeto File crudo
      ContentType: file.type,
      // Cloudflare R2 no suele necesitar ACL, pero si da error quita esta línea
      // ACL: 'public-read', 
    });

    await s3Client.send(command);

    // Devolvemos la URL pública
    return `${import.meta.env.VITE_R2_PUBLIC_URL}/${path}`;
  } catch (err) {
    console.error("Error subiendo a R2:", err);
    throw new Error("Fallo al subir archivo a la nube");
  }
};

export const deleteFileFromR2 = async (path) => {
  const command = new DeleteObjectCommand({
    Bucket: import.meta.env.VITE_R2_BUCKET,
    Key: path,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    console.warn("Error borrando de R2 (puede que ya no exista):", err);
  }
};