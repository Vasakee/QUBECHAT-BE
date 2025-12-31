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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
// src/chat/chat.service.ts
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const groq_service_1 = require("../common/groq.service");
const pdf_service_1 = require("../pdf/pdf.service");
const mongoose_3 = __importDefault(require("mongoose"));
let ChatService = class ChatService {
    constructor(chatModel, courseModel, // typed course model
    groq, pdfService) {
        this.chatModel = chatModel;
        this.courseModel = courseModel;
        this.groq = groq;
        this.pdfService = pdfService;
    }
    async list(courseID, userID) {
        const chats = await this.chatModel
            .find({ course: courseID, creator: userID })
            .sort({ createdAt: -1 });
        return { message: 'success', chats };
    }
    async create(body) {
        const session = await mongoose_3.default.startSession();
        session.startTransaction();
        try {
            const newChat = new this.chatModel({
                title: body.title || (body.courseTitle ? body.courseTitle + Date.now() : 'chat' + Date.now()),
                creator: body.creator,
                course: body.course,
                messages: body.messages || [],
            });
            const savedChat = await newChat.save({ session });
            await session.commitTransaction();
            session.endSession();
            return { message: 'success', chat: savedChat };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error.code === 11000) {
                return { status: 400, error: 'Duplicate key' };
            }
            return { status: 500, error: error.message };
        }
    }
    /**
     * Send messages with optional PDF context
     */
    async send(messages, courseId) {
        try {
            // If courseId provided, check for PDF content
            if (courseId) {
                const pdfContent = await this.pdfService.getPdfContent(courseId);
                if (pdfContent && pdfContent.trim().length > 0) {
                    // Use PDF-aware chat
                    const data = await this.groq.chatWithPDF(pdfContent, messages);
                    return data;
                }
                else {
                    // No PDF content found, inform user
                    console.log(`No PDF content found for course ${courseId}, using regular chat`);
                }
            }
            // Fallback to regular chat without PDF context
            const data = await this.groq.getGroqChatCompletion(messages);
            return data;
        }
        catch (error) {
            console.error('Chat error:', error);
            return { status: 400, error: error.message };
        }
    }
    /**
     * Send messages with streaming response
     */
    async sendStream(messages, courseId) {
        try {
            if (courseId) {
                const pdfContent = await this.pdfService.getPdfContent(courseId);
                if (pdfContent && pdfContent.trim().length > 0) {
                    return await this.groq.chatWithPDFStream(pdfContent, messages);
                }
            }
            return await this.groq.getGroqChatCompletionStream(messages);
        }
        catch (error) {
            console.error('Chat stream error:', error);
            throw error;
        }
    }
    async remove(id, userId) {
        try {
            const result = await this.chatModel.findOneAndDelete({ _id: id, creator: userId });
            if (result) {
                return { message: 'success', id };
            }
            else {
                return { status: 404, error: 'Item not found' };
            }
        }
        catch (error) {
            return { status: 500, error: 'Error deleting item' };
        }
    }
    /**
     * Get chat history with course info
     */
    async getChatWithCourse(chatId, userId) {
        try {
            const chat = await this.chatModel
                .findOne({ _id: chatId, creator: userId })
                .populate('course', 'title pdfProcessed');
            if (!chat) {
                return { status: 404, error: 'Chat not found' };
            }
            return { message: 'success', chat };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    /**
     * Add message to chat (used by WebSocket gateway)
     */
    async addMessageToChat(chatId, message) {
        try {
            const chat = await this.chatModel.findByIdAndUpdate(chatId, { $push: { messages: message } }, { new: true });
            if (!chat) {
                return { status: 404, error: 'Chat not found' };
            }
            return { message: 'Message added successfully', chat };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('chats')),
    __param(1, (0, mongoose_1.InjectModel)('courses')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        groq_service_1.GroqService,
        pdf_service_1.PdfService])
], ChatService);
//# sourceMappingURL=chat.service.js.map