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
exports.QuizSchema = exports.Quiz = exports.QuizAttempt = exports.QuizQuestion = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let QuizQuestion = class QuizQuestion {
};
exports.QuizQuestion = QuizQuestion;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "prompt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], QuizQuestion.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "answer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "explanation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['mcq', 'short'], default: 'mcq' }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "kind", void 0);
exports.QuizQuestion = QuizQuestion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], QuizQuestion);
let QuizAttempt = class QuizAttempt {
};
exports.QuizAttempt = QuizAttempt;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QuizAttempt.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "total", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "percent", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                questionIndex: { type: Number, required: true },
                answer: { type: String, required: true },
                correct: { type: Boolean, required: true },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], QuizAttempt.prototype, "answers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], QuizAttempt.prototype, "takenAt", void 0);
exports.QuizAttempt = QuizAttempt = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], QuizAttempt);
let Quiz = class Quiz {
};
exports.Quiz = Quiz;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'courses', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quiz.prototype, "course", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quiz.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['quiz', 'exam'], default: 'quiz' }),
    __metadata("design:type", String)
], Quiz.prototype, "quizType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Quiz.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'groupchats' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Quiz.prototype, "groupId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [QuizQuestion], default: [] }),
    __metadata("design:type", Array)
], Quiz.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [QuizAttempt], default: [] }),
    __metadata("design:type", Array)
], Quiz.prototype, "attempts", void 0);
exports.Quiz = Quiz = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Quiz);
exports.QuizSchema = mongoose_1.SchemaFactory.createForClass(Quiz);
//# sourceMappingURL=quiz.schema.js.map