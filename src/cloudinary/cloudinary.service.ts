import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadResult } from './cloudinary.types';

type CloudinaryInstance = typeof cloudinary;

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: CloudinaryInstance,
  ) {}
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream({ resource_type: 'auto' }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        })
        .end(file.buffer);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
}
