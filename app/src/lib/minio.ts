import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
  secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
});

const BUCKET = process.env.MINIO_BUCKET || "school-erp";

async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
  }
}

export async function uploadFile(
  objectKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  await ensureBucket();
  await minioClient.putObject(BUCKET, objectKey, buffer, buffer.length, {
    "Content-Type": mimeType,
  });
  return objectKey;
}

export async function getFileStream(objectKey: string) {
  await ensureBucket();
  return minioClient.getObject(BUCKET, objectKey);
}

export async function deleteFile(objectKey: string) {
  await ensureBucket();
  await minioClient.removeObject(BUCKET, objectKey);
}

export { minioClient, BUCKET };
