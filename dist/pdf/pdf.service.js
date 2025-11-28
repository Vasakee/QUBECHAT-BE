"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
// src/pdf/pdf.service.ts
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fs = __importStar(require("fs"));
const pdfParse = require('pdf-parse');
let PdfService = class PdfService {
    constructor(courseModel) {
        this.courseModel = courseModel;
    }
    async extractTextFromPDF(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        }
        catch (error) {
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }
    async savePdfContent(courseId, pdfText) {
        try {
            const course = await this.courseModel.findById(courseId);
            if (!course) {
                return { status: 404, error: 'Course not found' };
            }
            course.pdfContent = pdfText;
            course.pdfProcessed = true;
            course.pdfProcessedAt = new Date();
            await course.save();
            return {
                message: 'PDF content saved successfully',
                courseId,
                contentLength: pdfText.length
            };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    async getPdfContent(courseId) {
        try {
            const course = await this.courseModel.findById(courseId).select('pdfContent');
            return course?.pdfContent || null;
        }
        catch (error) {
            throw new Error(`Failed to get PDF content: ${error.message}`);
        }
    }
    async processPdfForCourse(courseId, filePath) {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return { status: 404, error: 'PDF file not found' };
            }
            // Extract text from PDF
            const pdfText = await this.extractTextFromPDF(filePath);
            if (!pdfText || pdfText.trim().length === 0) {
                return { status: 400, error: 'No text could be extracted from PDF' };
            }
            // Save to course
            const result = await this.savePdfContent(courseId, pdfText);
            // Optionally delete the file after processing (uncomment if needed)
            // fs.unlinkSync(filePath);
            return {
                message: 'PDF processed successfully',
                courseId,
                textLength: pdfText.length,
                preview: pdfText.substring(0, 200) + '...',
            };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    /**
     * Get course info including PDF status
     */
    async getCourseWithPdfStatus(courseId) {
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
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('courses')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PdfService);
//# sourceMappingURL=pdf.service.js.map