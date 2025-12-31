// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';
import { IAppResponse } from '../interfaces/app-response.interface';

@Injectable()
export class UploadService {
  constructor(private pdfService: PdfService) {}

  async uploadDoc(files: Array<Express.Multer.File>, courseId?: string): Promise<IAppResponse<any>> {
    try {
      console.log('');
      console.log('UPLOAD SERVICE');
      console.log('Files:', files?.length || 0);
      console.log('CourseId:', courseId);
      console.log('CourseId type:', typeof courseId);
      console.log('CourseId valid:', !!courseId && courseId !== 'undefined' && courseId.trim() !== '');
      console.log('');

      if (!files || files.length === 0) {
        return { success: false, message: 'No files uploaded', data: null };
      }

      // Map uploaded files with metadata
      const uploadedFiles = files.map((f) => ({
        path: f.path,
        filename: f.filename,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      }));

      console.log('Uploaded files:', uploadedFiles.map(f => f.originalname));

      // If courseId is provided, attempt to process the first file with a parser
      if (courseId && courseId !== 'undefined' && courseId.trim() !== '') {
        console.log('Valid courseId detected, attempting file parsing...');

        const targetFile = files[0];
        console.log('Selected file for parsing:', targetFile?.originalname, targetFile?.mimetype);

        if (targetFile) {
          try {
            console.log('PROCESSING FILE');
            console.log('File: ' + targetFile.originalname);
            console.log('Course: ' + courseId);
            console.log('Path: ' + targetFile.path);

            const parseResult = await this.pdfService.processFileForCourse(
              courseId,
              targetFile.path,
            );

            console.log('PARSE RESULT', JSON.stringify(parseResult, null, 2));

            if ('status' in parseResult && parseResult.status && parseResult.status !== 200) {
              console.error('File processing returned error status');
              return {
                success: false,
                message: 'File uploaded but processing failed',
                data: { 
                  files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
                  processing: parseResult,
                }
              };
            }

            console.log('File processing successful!');
            return {
              success: true,
              message: 'File uploaded and processed successfully',
              data: { 
                files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
                processing: parseResult,
              }
            };
          } catch (error) {
            console.error('FILE PROCESSING ERROR', error);
            return {
              success: false,
              message: 'File uploaded but processing failed',
              data: { 
                files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
                error: error.message,
              }
            };
          }
        }
      } else {
        console.log('No valid courseId provided - skipping file processing');
      }

      // No courseId, just return uploaded files
      return {
        success: true,
        message: 'File uploaded successfully',
        data: { 
          files: uploadedFiles.map((f) => f.path),
          note: 'To process PDF for a course, include courseId in the request',
        }
      };
    } catch (error) {
      console.error('');
      console.error('UPLOAD SERVICE ERROR');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      console.error('');
      
      return { success: false, message: 'Upload failed', data: { error: error.message } };
    }
  }
}