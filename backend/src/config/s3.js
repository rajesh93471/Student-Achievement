import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getS3Config = () => ({
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_S3_BUCKET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const getS3Client = () => {
  const { region, accessKeyId, secretAccessKey } = getS3Config();
  if (!region || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const createUploadUrl = async ({ key, contentType }) => {
  const { region, bucketName } = getS3Config();
  const s3Client = getS3Client();
  console.log("[s3] region=", region, "bucket=", bucketName, "s3Client=", !!s3Client);
  if (!s3Client || !bucketName) {
    console.log("[s3] returning mock URLs");
    return {
      key,
      uploadUrl: `https://example.invalid/mock-upload/${key}`,
      fileUrl: `https://example.invalid/mock-files/${key}`,
      mock: true,
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { key, uploadUrl, fileUrl, mock: false };
};

export const createDownloadUrl = async ({ key }) => {
  const { region, bucketName } = getS3Config();
  const s3Client = getS3Client();
  if (!s3Client || !bucketName) {
    return {
      downloadUrl: `https://example.invalid/mock-files/${key}`,
      mock: true,
    };
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return { downloadUrl, mock: false };
};
