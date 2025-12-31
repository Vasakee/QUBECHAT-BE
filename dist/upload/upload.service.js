"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
// src/upload/upload.service.ts
const common_1 = require("@nestjs/common");
const pdf_service_1 = require("../pdf/pdf.service");
let UploadService = class UploadService {
    constructor(pdfService) {
        this.pdfService = pdfService;
    }
    async uploadDoc(files, courseId) {
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
                        const parseResult = await this.pdfService.processFileForCourse(courseId, targetFile.path);
                        console.log('PARSE RESULT', JSON.stringify(parseResult, null, 2));
                        if ('status' in parseResult && parseResult.status && parseResult.status !== 200) {
                            console.error('File processing returned error status');
                            return {
                                message: 'File uploaded but processing failed',
                                files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
                                processing: parseResult,
                            };
                        }
                        console.log('File processing successful!');
                        return {
                            message: 'File uploaded and processed successfully',
                            files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
                            processing: parseResult,
                        };
                    }
                    catch (error) {
                        console.error('FILE PROCESSING ERROR', error);
                        return {
                            message: 'File uploaded but processing failed',
                            files: uploadedFiles.map((f) => ({ path: f.path, name: f.originalname })),
                            error: error.message,
                        };
                    }
                }
            }
            else {
                console.log('No valid courseId provided - skipping file processing');
            }
            // No courseId, just return uploaded files
            return {
                message: 'File uploaded successfully',
                files: uploadedFiles.map((f) => f.path),
                note: 'To process PDF for a course, include courseId in the request',
            };
        }
        catch (error) {
            console.error('');
            console.error('UPLOAD SERVICE ERROR');
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            console.error('');
            return { status: 500, error: error.message };
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pdf_service_1.PdfService])
], UploadService);
//# sourceMappingURL=upload.service.js.map