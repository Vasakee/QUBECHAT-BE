"use strict";
// src/course/course.controller.ts
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
exports.CourseController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const course_service_1 = require("./course.service");
const swagger_1 = require("@nestjs/swagger");
const create_course_dto_1 = require("./dto/create-course.dto");
let CourseController = class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
    }
    test() {
        return { msg: 'Course module works!' };
    }
    async list(req) {
        return await this.courseService.list(req.user.id);
    }
    async create(body, req) {
        return await this.courseService.create(body, req.user.id);
    }
    async remove(id, req) {
        return await this.courseService.remove(id, req.user.id);
    }
};
exports.CourseController = CourseController;
__decorate([
    (0, common_1.Get)('test'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List all courses for the authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of courses' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('new'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new course' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Course created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Title already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_dto_1.CreateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a course (only owner)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "remove", null);
exports.CourseController = CourseController = __decorate([
    (0, swagger_1.ApiTags)('Course'),
    (0, swagger_1.ApiBearerAuth)('jwt'),
    (0, common_1.Controller)('api/v1/course'),
    __metadata("design:paramtypes", [course_service_1.CourseService])
], CourseController);
//# sourceMappingURL=course.controller.js.map