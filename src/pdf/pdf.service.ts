// src/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import { CourseDocument } from '../schemas/course.schema';

// Import pdf-parse correctly
const pdfParse = require('pdf-parse');

@Injectable()
export class PdfService {
  constructor(@InjectModel('courses') private courseModel: Model<CourseDocument>) {}

  /**
   * Extract text from PDF file using pdf-parse
   */
  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      // Read the PDF file
      const dataBuffer = fs.readFileSync(filePath);
      
      // Parse the PDF
      const data = await pdfParse(dataBuffer);
      
      // Return extracted text
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

// src/pdf/pdf.service.ts
async savePdfContent(courseId: string, pdfText: string) {
  try {
    console.log('');
    console.log('💾 ====== SAVE PDF CONTENT ======');
    console.log('🆔 CourseId:', courseId);
    console.log('📏 Text length:', pdfText.length);
    console.log('📝 Text preview:', pdfText.substring(0, 100));
    
    // Validate courseId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error('❌ Invalid courseId format:', courseId);
      console.log('=================================');
      console.log('');
      return { status: 400, error: 'Invalid course ID format' };
    }

    console.log('✅ Valid ObjectId format');
    console.log('🔍 Updating course directly in database...');

    // Use findByIdAndUpdate with $set operator
    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        $set: {
          pdfContent: pdfText,
          pdfProcessed: true,
          pdfProcessedAt: new Date(),
          pdfFileName: 'document.pdf',
        }
      },
      { 
        new: true, // Return the updated document
        runValidators: false, // Skip validation for optional fields
      }
    );

    if (!updatedCourse) {
      console.error('❌ Course not found');
      console.log('=================================');
      console.log('');
      return { status: 404, error: 'Course not found' };
    }

    console.log('✅ Update successful!');
    console.log('📊 Updated course:', {
      id: updatedCourse._id,
      title: updatedCourse.title,
      pdfProcessed: updatedCourse.pdfProcessed,
      pdfContentLength: updatedCourse.pdfContent?.length || 0,
      pdfProcessedAt: updatedCourse.pdfProcessedAt,
    });

    // Verify the update by reading it back
    console.log('🔍 Verifying update...');
    const verification = await this.courseModel.findById(courseId).select('pdfContent pdfProcessed');
    console.log('✅ Verification:', {
      pdfProcessed: verification?.pdfProcessed,
      pdfContentLength: verification?.pdfContent?.length || 0,
    });
    console.log('=================================');
    console.log('');

    return {
      message: 'PDF content saved successfully',
      courseId,
      contentLength: pdfText.length,
    };
  } catch (error) {
    console.error('');
    console.error('❌ ====== SAVE ERROR ======');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('==========================');
    console.error('');
    
    return { status: 500, error: error.message };
  }
}
  /**
   * Get PDF content for a course
   */
  async getPdfContent(courseId: string): Promise<string | null> {
    try {
      const course = await this.courseModel.findById(courseId).select('pdfContent');
      return course?.pdfContent || null;
    } catch (error) {
      throw new Error(`Failed to get PDF content: ${error.message}`);
    }
  }

  /**
   * Process uploaded PDF and save to course
   */
  async processPdfForCourse(courseId: string, filePath: string) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { status: 404, error: 'PDF file not found' };
      }

      console.log(`Processing PDF: ${filePath} for course: ${courseId}`);

      // Extract text from PDF
      const pdfText = await this.extractTextFromPDF(filePath);

      if (!pdfText || pdfText.trim().length === 0) {
        return { status: 400, error: 'No text could be extracted from PDF' };
      }

      console.log(`Extracted ${pdfText.length} characters from PDF`);

      // Save to course
      const result = await this.savePdfContent(courseId, pdfText);

      if (result.status && result.status !== 200) {
        return result;
      }

      // Optionally delete the file after processing (uncomment if needed)
      // fs.unlinkSync(filePath);

      return {
        message: 'PDF processed successfully',
        courseId,
        textLength: pdfText.length,
        preview: pdfText.substring(0, 200) + '...',
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return { status: 500, error: error.message };
    }
  }

  /**
   * Get course info including PDF status
   */
  async getCourseWithPdfStatus(courseId: string) {
    try {
      const course = await this.courseModel
        .findById(courseId)
        .select('title pdfProcessed pdfProcessedAt pdfFileName');

      if (!course) {
        return { status: 404, error: 'Course not found' };
      }

      return {
        message: 'success',
        course: {
          id: course._id,
          title: course.title,
          pdfProcessed: course.pdfProcessed || false,
          pdfProcessedAt: course.pdfProcessedAt,
          pdfFileName: course.pdfFileName,
        },
      };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }
}