// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class UploadService {
  constructor(private pdfService: PdfService) {}

  async uploadDoc(files: Array<Express.Multer.File>, courseId?: string) {
    try {
      console.log('');
      console.log('UPLOAD SERVICE');
      console.log('Files:', files?.length || 0);
      console.log('CourseId:', courseId);
      console.log('CourseId type:', typeof courseId);
      console.log('CourseId valid:', !!courseId && courseId !== 'undefined' && courseId.trim() !== '');
      console.log('');

      if (!files || files.length === 0) {
        return { status: 400, error: 'No files uploaded' };
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

      // If courseId is provided, process PDF
      if (courseId && courseId !== 'undefined' && courseId.trim() !== '') {
        console.log('Valid courseId detected, searching for PDF...');
        
        const pdfFile = files.find(
          (f) =>
            f.originalname?.toLowerCase().endsWith('.pdf') ||
            f.mimetype === 'application/pdf',
        );

        console.log('PDF file search result:', {
          found: !!pdfFile,
          filename: pdfFile?.originalname,
          mimetype: pdfFile?.mimetype,
          path: pdfFile?.path
        });

        if (pdfFile) {
          try {
            console.log('');
            console.log('PROCESSING PDF');
            console.log('File: ' + pdfFile.originalname);
            console.log('Course: ' + courseId);
            console.log('Path: ' + pdfFile.path);
            console.log('');

            const pdfResult = await this.pdfService.processPdfForCourse(
              courseId,
              pdfFile.path,
            );

            console.log('');
            console.log('PDF RESULT');
            console.log(JSON.stringify(pdfResult, null, 2));
            console.log('');

            if ('status' in pdfResult && pdfResult.status && pdfResult.status !== 200) {
              console.error('PDF processing returned error status');
              return {
                message: 'File uploaded but PDF processing failed',
                files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
                pdfProcessing: pdfResult,
              };
            }

            console.log('PDF processing successful!');
            return {
              message: 'File uploaded and PDF processed successfully',
              files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
              pdfProcessing: pdfResult,
            };
          } catch (error) {
            console.error('');
            console.error('PDF ERROR');
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            console.error('');
            
            return {
              message: 'File uploaded but PDF processing failed',
              files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
              error: error.message,
            };
          }
        } else {
          console.log('No PDF file found in uploaded files');
          return {
            message: 'File uploaded (no PDF found for processing)',
            files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
            note: 'To process PDF, upload a .pdf file with courseId',
          };
        }
      } else {
        console.log('No valid courseId provided - skipping PDF processing');
      }

      // No courseId, just return uploaded files
      return {
        message: 'File uploaded successfully',
        files: uploadedFiles.map((f) => f.path),
        note: 'To process PDF for a course, include courseId in the request',
      };
    } catch (error) {
      console.error('');
      console.error('UPLOAD SERVICE ERROR');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      console.error('');
      
      return { status: 500, error: error.message };
    }
  }
}