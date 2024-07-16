import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadException } from 'src/common/exception/file-upload.exception';

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);
  private region: string;
  private s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.region = configService.get<string>('upload.AWS_S3_REGION');
    this.s3 = new S3Client({
      endpoint: configService.get<string>('upload.AWS_ENDPOINT'),
      credentials: {
        accessKeyId: configService.get<string>('upload.AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>(
          'upload.AWS_SECRET_ACCESS_KEY',
        ),
      },
      forcePathStyle: true,
      region: this.region,
    });
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    const bucket = this.configService.get<string>('upload.AWS_S3_BUCKET');
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

      if (response.$metadata.httpStatusCode === 200) {
        return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }

      throw new FileUploadException('File not saved in S3!');
    } catch (error) {
      this.logger.error(`Cannot save file ${key} to s3,`, error);
      if (error.code === 'ECONNREFUSED') {
        throw new FileUploadException(
          'File upload service is currently unavailable. Please try again later.',
        );
      }

      throw new FileUploadException(
        'An unexpected error occurred while uploading the file.',
      );
    }
  }

  async deleteFile(key: string) {
    const bucket = this.configService.get<string>('upload.AWS_S3_BUCKET');

    const params = {
      Bucket: bucket,
      Key: key,
    };

    try {
      await this.s3.send(new DeleteObjectCommand(params));
      this.logger.log(`File ${key} deleted successfully from S3.`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key} from S3:`, error);
      if (error.code === 'ECONNREFUSED') {
        throw new FileUploadException(
          'File upload service is currently unavailable. Please try again later.',
        );
      }

      throw new FileUploadException(
        'An unexpected error occurred while uploading the file.',
      );
    }
  }
}
