import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);
  private region: string;
  private s3: S3Client;

  constructor() {
    this.region = `${process.env.AWS_S3_REGION}`;
    this.s3 = new S3Client({
      endpoint: `${process.env.AWS_ENDPOINT}`,
      credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
      },
      forcePathStyle: true,
      region: this.region,
    });
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    const bucket = `${process.env.AWS_S3_BUCKET}`;
    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: bucket,
      Key: key,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(input),
      );

      console.log(response);
      if (response.$metadata.httpStatusCode === 200) {
        return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }

      throw new Error('File not saved in s3!');
    } catch (error) {
      this.logger.error('Cannot save file to s3,', error);
      throw error;
    }
  }
}
