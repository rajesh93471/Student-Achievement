import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

const getStorageConfig = () => ({
  mode: (process.env.STORAGE_MODE || 'local').toLowerCase(),
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_S3_BUCKET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/achieve',
});

const getS3Client = () => {
  const config = getStorageConfig();
  if (!config.region || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

export const createUploadUrl = async ({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) => {
  const config = getStorageConfig();

  if (config.mode === 'local') {
    return {
      key,
      uploadUrl: `${config.baseUrl}/documents/upload`,
      fileUrl: `${config.baseUrl}/uploads/${key}`,
      mode: 'local',
    };
  }

  const s3Client = getS3Client();
  if (!s3Client || !config.bucketName) {
    return {
      key,
      uploadUrl: `https://example.invalid/mock-upload/${key}`,
      fileUrl: `https://example.invalid/mock-files/${key}`,
      mock: true,
    };
  }

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const fileUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  return { key, uploadUrl, fileUrl, mock: false };
};

export const createDownloadUrl = async ({ key }: { key: string }) => {
  const config = getStorageConfig();

  if (config.mode === 'local') {
    return {
      downloadUrl: `${config.baseUrl}/uploads/${key}`,
      mode: 'local',
    };
  }

  const s3Client = getS3Client();
  if (!s3Client || !config.bucketName) {
    return {
      downloadUrl: `https://example.invalid/mock-files/${key}`,
      mock: true,
    };
  }

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return { downloadUrl, mock: false };
};

export const saveLocalFile = (file: Express.Multer.File, key: string) => {
  const uploadPath = path.join(__dirname, '..', '..', 'uploads', key);
  const dir = path.dirname(uploadPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(uploadPath, file.buffer);
  return key;
};
