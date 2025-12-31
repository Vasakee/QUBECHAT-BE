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
exports.FlashcardSchema = exports.Flashcard = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Flashcard = class Flashcard {
};
exports.Flashcard = Flashcard;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Flashcard.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Flashcard.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Flashcard.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'courses', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Flashcard.prototype, "course", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
                difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
                lastReviewedAt: { type: Date },
                reviewCount: { type: Number, default: 0 },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Flashcard.prototype, "cards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['public', 'private', 'shared'], default: 'private' }),
    __metadata("design:type", String)
], Flashcard.prototype, "visibility", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'users' }], default: [] }),
    __metadata("design:type", Array)
], Flashcard.prototype, "sharedWith", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Flashcard.prototype, "totalCards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'new' }),
    __metadata("design:type", String)
], Flashcard.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Flashcard.prototype, "masteredCount", void 0);
exports.Flashcard = Flashcard = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Flashcard);
exports.FlashcardSchema = mongoose_1.SchemaFactory.createForClass(Flashcard);
// Index for efficient queries
exports.FlashcardSchema.index({ creator: 1, course: 1 });
exports.FlashcardSchema.index({ visibility: 1 });
//# sourceMappingURL=flashcard.schema.js.map