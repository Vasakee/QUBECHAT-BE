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
exports.GroqService = void 0;
const common_1 = require("@nestjs/common");
const Groq = require('groq-sdk');
let GroqService = class GroqService {
    constructor() {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        // Read model name from env so it's configurable without code changes.
        // If not provided, keep the historical default but prefer explicit config.
        this.modelName = process.env.GROQ_MODEL || 'llama3-8b-8192';
    }
    async getGroqChatCompletion(messages) {
        try {
            return await this.groq.chat.completions.create({
                messages: [...messages],
                model: this.modelName,
            });
        }
        catch (err) {
            // Surface helpful error message when model is decommissioned
            const errBody = err?.response?.data || err?.message || err;
            if (errBody && typeof errBody === 'object' && errBody.error && errBody.error.code === 'model_decommissioned') {
                throw new Error(`Groq model "${this.modelName}" is decommissioned: ${errBody.error.message}. Set a supported model in GROQ_MODEL (see https://console.groq.com/docs/deprecations)`);
            }
            // Re-throw original error for other cases
            throw err;
        }
    }
};
exports.GroqService = GroqService;
exports.GroqService = GroqService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GroqService);
//# sourceMappingURL=groq.service.js.map