// src/common/groq.service.ts
import { Injectable } from '@nestjs/common';
const Groq = require('groq-sdk');

@Injectable()
export class GroqService {
  private groq: any;
  private modelName: string;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    // Use updated model from env or default to llama-3.3-70b-versatile
    this.modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  /**
   * Standard chat completion without PDF context
   */
  async getGroqChatCompletion(messages: any[]) {
    try {
      return await this.groq.chat.completions.create({
        messages: [...messages],
        model: this.modelName,
        temperature: 0.7,
        max_completion_tokens: 2048,
      });
    } catch (err: any) {
      // Surface helpful error message when model is decommissioned
      const errBody = err?.response?.data || err?.message || err;
      if (errBody && typeof errBody === 'object' && errBody.error && errBody.error.code === 'model_decommissioned') {
        throw new Error(
          `Groq model "${this.modelName}" is decommissioned: ${errBody.error.message}. Set a supported model in GROQ_MODEL (see https://console.groq.com/docs/deprecations)`,
        );
      }
      // Re-throw original error for other cases
      throw err;
    }
  }

  /**
   * Chat completion WITH PDF context for study chatbot
   */
  async chatWithPDF(pdfContent: string, messages: any[]) {
    try {
      // Limit PDF content to avoid token limits (~100k tokens for llama-3.3-70b)
      // Roughly 4 chars = 1 token, so 400k chars ≈ 100k tokens
      const maxPdfChars = 400000;
      const truncatedPdfContent = pdfContent.length > maxPdfChars 
        ? pdfContent.substring(0, maxPdfChars) + '\n\n[Content truncated due to length...]'
        : pdfContent;

      // Add system message with PDF context
      const systemMessage = {
        role: 'system',
        content: `You are SAGE, a helpful study assistant. Answer questions based on the following study material.

Study Material:
${truncatedPdfContent}

Instructions:
- Answer questions based ONLY on the study material provided above
- If the answer is not in the material, politely say "I don't see that information in the study material"
- Keep answers clear, educational, and concise
- Use examples from the material when helpful
- If asked to explain concepts, break them down step by step
- Be encouraging and supportive to help students learn`,
      };

      // Combine system message with user messages
      const fullMessages = [systemMessage, ...messages];

      return await this.groq.chat.completions.create({
        messages: fullMessages,
        model: this.modelName,
        temperature: 0.5, // Lower temperature for more focused, accurate answers
        max_completion_tokens: 2048,
        top_p: 1,
      });
    } catch (err: any) {
      const errBody = err?.response?.data || err?.message || err;
      if (errBody && typeof errBody === 'object' && errBody.error && errBody.error.code === 'model_decommissioned') {
        throw new Error(
          `Groq model "${this.modelName}" is decommissioned: ${errBody.error.message}. Set a supported model in GROQ_MODEL`,
        );
      }
      throw err;
    }
  }

  /**
   * Streaming chat completion (for real-time responses)
   */
  async getGroqChatCompletionStream(messages: any[]) {
    try {
      return await this.groq.chat.completions.create({
        messages: [...messages],
        model: this.modelName,
        temperature: 0.7,
        max_completion_tokens: 2048,
        stream: true, // Enable streaming
      });
    } catch (err: any) {
      const errBody = err?.response?.data || err?.message || err;
      if (errBody && typeof errBody === 'object' && errBody.error && errBody.error.code === 'model_decommissioned') {
        throw new Error(
          `Groq model "${this.modelName}" is decommissioned: ${errBody.error.message}`,
        );
      }
      throw err;
    }
  }

  /**
   * Streaming chat WITH PDF context
   */
  async chatWithPDFStream(pdfContent: string, messages: any[]) {
    try {
      const maxPdfChars = 400000;
      const truncatedPdfContent = pdfContent.length > maxPdfChars 
        ? pdfContent.substring(0, maxPdfChars) + '\n\n[Content truncated due to length...]'
        : pdfContent;

      const systemMessage = {
        role: 'system',
        content: `You are SAGE, a helpful study assistant. Answer questions based on the following study material.

Study Material:
${truncatedPdfContent}

Instructions:
- Answer based on the study material provided
- If the answer is not in the material, say so politely
- Keep answers clear and educational
- Use examples from the material when helpful`,
      };

      const fullMessages = [systemMessage, ...messages];

      return await this.groq.chat.completions.create({
        messages: fullMessages,
        model: this.modelName,
        temperature: 0.5,
        max_completion_tokens: 2048,
        stream: true,
      });
    } catch (err: any) {
      const errBody = err?.response?.data || err?.message || err;
      if (errBody && typeof errBody === 'object' && errBody.error && errBody.error.code === 'model_decommissioned') {
        throw new Error(
          `Groq model "${this.modelName}" is decommissioned: ${errBody.error.message}`,
        );
      }
      throw err;
    }
  }

  /**
   * Test connection to Groq API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Say "API is working"' }],
        model: this.modelName,
        max_completion_tokens: 10,
      });
      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('Groq connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current model name being used
   */
  getModelName(): string {
    return this.modelName;
  }
}