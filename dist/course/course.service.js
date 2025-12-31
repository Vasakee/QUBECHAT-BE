"use strict";
// src/course/course.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CourseService = class CourseService {
    constructor(courseModel) {
        this.courseModel = courseModel;
    }
    async list(userId) {
        const courses = await this.courseModel
            .find({ creator: userId })
            .populate('chats')
            .sort({ createdAt: -1 });
        return { message: 'success', courses };
    }
    async create(body, authenticatedUserId) {
        const newCourse = new this.courseModel({
            title: body.title,
            description: body.description || '',
            creator: authenticatedUserId,
            chats: [],
            files: body.files || [],
            date: Date.now(),
            pdfContent: null,
            pdfMarkdown: '',
            pdfJson: null,
            pdfPageCount: null,
            pdfCharCount: null,
            pdfProcessed: false,
            pdfProcessedAt: null,
            pdfFileName: null,
        });
        try {
            const course = await newCourse.save();
            return { message: 'success', course };
        }
        catch (error) {
            if (error.code === 11000 && error.keyPattern?.title) {
                return { status: 400, error: 'Course title already exists' };
            }
            return { status: 500, error: error.message || 'Failed to create course' };
        }
    }
    async remove(id, userId) {
        const result = await this.courseModel.findOneAndDelete({
            _id: id,
            creator: userId,
        });
        return result
            ? { message: 'success', id }
            : { status: 404, error: 'Course not found' };
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('courses')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CourseService);
//# sourceMappingURL=course.service.js.map