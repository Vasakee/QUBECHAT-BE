# API Response Standardization - Implementation Guide

## Overview
All API responses should follow the `IAppResponse<T>` interface:
```typescript
export interface IAppResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
```

## Completed ✅
1. **Created**: `src/interfaces/app-response.interface.ts`
2. **Created**: `src/common/response.helper.ts` (utility functions)
3. **Updated**: `src/auth/auth.service.ts` - Returns IAppResponse
4. **Updated**: `src/auth/auth.controller.ts` - Uses IAppResponse
5. **Updated**: `src/upload/upload.service.ts` - Returns IAppResponse
6. **Updated**: `src/course/course.service.ts` - All methods return IAppResponse

## Remaining Updates

### For PDF Service & Controller
**File**: `src/pdf/pdf.service.ts`

Add import at top:
```typescript
import { IAppResponse } from '../interfaces/app-response.interface';
```

Update method signatures:
- `async extractTextFromPDF(filePath: string): Promise<IAppResponse<{text: string}>>`
- `async parseFileToText(filePath: string): Promise<IAppResponse<{text: string}>>`
- `async processFileForCourse(courseId: string, filePath: string): Promise<IAppResponse<any>>`
- `async savePdfContent(courseId: string, pdfText: string): Promise<IAppResponse<any>>`
- `async getPdfContent(courseId: string): Promise<IAppResponse<{content: string}>>`

**File**: `src/pdf/pdf.controller.ts`

Add import:
```typescript
import { IAppResponse } from '../interfaces/app-response.interface';
```

Update all methods to return IAppResponse - all return statements should follow:
```typescript
return { success: true, message: "...", data: {...} };
```

### For Chat Service & Controller
**File**: `src/chat/chat.service.ts` & `src/chat/chat.controller.ts`

Add IAppResponse import and update all methods to follow the interface pattern.

### For GroupChat
**File**: `src/groupchat/groupchat.service.ts` & `src/groupchat/groupchat.controller.ts`

Add IAppResponse import and update all methods.

### For Flashcard
**File**: `src/flashcard/flashcard.service.ts` & `src/flashcard/flashcard.controller.ts`

Add IAppResponse import and update all methods.

### For Quiz
**File**: `src/quiz/*.ts` controllers

Add IAppResponse import and standardize all responses.

## Response Pattern Examples

### Success Response
```typescript
return {
  success: true,
  message: 'Operation successful',
  data: { ... }
};
```

### Error Response
```typescript
return {
  success: false,
  message: 'Operation failed',
  // data is optional for errors
};
```

### With Error Handling
```typescript
try {
  const result = await someOperation();
  return {
    success: true,
    message: 'Operation completed',
    data: result
  };
} catch (error) {
  return {
    success: false,
    message: `Failed: ${error.message}`
  };
}
```

## Testing
After updates, compile and test:
```bash
npm run build
npm run start:dev
```

Verify all endpoints return responses in the standardized format.
