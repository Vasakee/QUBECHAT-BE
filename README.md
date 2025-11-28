# SAGE Backend – NestJS Conversion ✨

This repository contains the SAGE backend rewritten with NestJS and TypeScript. It provides authentication, course management, document upload & PDF text extraction, and a chat interface that includes PDF context when available.

## Key Features

- JWT authentication (Passport + JWT strategy)
- Course CRUD with file attachments
- File uploads using Multer (shared `multerOptions` in `src/upload/multer.options.ts`)
- PDF extraction (uses `pdf-parse` where available, falls back to `pdfjs-dist`)
- Chat integration with Groq LLM; chat can include PDF content as system context
- Validation using `class-validator` + DTOs; Swagger/OpenAPI docs available at `/docs`

## Project layout (important folders)

```
src/
├── auth/         # Auth module (controllers, service, DTOs)
├── chat/         # Chat module (controllers, service, DTOs)
├── course/       # Course module
├── pdf/          # PDF processing module (extract + save text)
├── upload/       # Upload controllers + shared multer options
├── common/       # Groq LLM integration
├── schemas/      # Mongoose schemas
├── app.module.ts
└── main.ts
```

## Quick start

1. Install dependencies

```powershell
npm install --legacy-peer-deps
```

If you use the PDF fallback or need dev types for `pdf-parse`, also install:

```powershell
npm install pdfjs-dist --legacy-peer-deps
npm install -D @types/pdf-parse --legacy-peer-deps
```

2. Create a `.env` in the project root (example):

```env
PORT=4000
mongoURI=mongodb://...your-mongo-uri...
JWTKey=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=http://localhost:3000
```

3. Run the dev server

```powershell
npm run start:dev
```

The app will start on `http://localhost:4000` (or the port in `.env`). Open Swagger UI at `http://localhost:4000/docs` to explore and test endpoints. Use the Authorize button to paste a JWT for protected endpoints.

## Important API endpoints

Authentication
- `POST /api/auth/register` — Register (body: `RegisterDto`)
- `POST /api/auth/login` — Login (body: `LoginDto`)

Courses
- `GET /api/course/list` — List user's courses (requires JWT)
- `POST /api/course/new` — Create a course (body: `CreateCourseDto`)

Uploads
- `POST /api/upload/doc` — Upload documents (multipart/form-data). Field `files` accepts up to 10 files. If `courseId` is included in the form, the service will automatically look for a PDF and process it for that course.

PDF processing
- `POST /api/pdf/process/:courseId` — Process an existing PDF file on disk (JSON body: `{ filePath }`)
- `POST /api/pdf/process/:courseId/upload` — Upload a single file (field `file`) and process it for the course (multipart/form-data)
- `POST /api/pdf/extract` — Extract text from a PDF on disk (JSON body: `{ filePath }`)
- `POST /api/pdf/save-content` — Save extracted PDF text to a course (JSON body: `{ courseId, pdfText }`)
- `GET /api/pdf/content/:courseId` — Get stored PDF content preview and length

Chat
- `POST /api/chat/send` — Send messages to the Groq model. Accepts `messages` array and optional `courseId` to include PDF context in the system prompt.
- `POST /api/chat/send-stream` — Streaming variant for SSE clients.

## How PDF text gets to the model (high level)

1. Upload a PDF via `/api/upload/doc` (or `/api/pdf/process/:courseId/upload`).
2. `UploadService` detects the PDF and calls `PdfService.processPdfForCourse(courseId, filePath)`.
3. `PdfService.extractTextFromPDF()` extracts text (pdf-parse or pdfjs fallback) and `savePdfContent()` writes the text to the Course record (`course.pdfContent`, `pdfProcessed`, `pdfProcessedAt`).
4. When a chat call includes a `courseId`, `ChatService` fetches `pdfContent` and passes it to `GroqService.chatWithPDF()` as a system message so the model can answer using the document as context.

Note: the current implementation prepends the full (or truncated) document as a system message. For large documents you may want to chunk + retrieve relevant passages or add embeddings + a vector store for RAG (recommended for scale).

## Swagger / OpenAPI notes

- Swagger is enabled and available at `/docs`.
- Endpoints that accept JSON bodies use DTO classes decorated with `@ApiProperty` so the Swagger UI shows fields and examples.
- Multipart file upload endpoints use `@ApiConsumes('multipart/form-data')` and `@ApiBody` so the Swagger UI displays a file chooser.

## Dev & troubleshooting

- Type-check without building:

```powershell
npx tsc --noEmit
```

- If you see peer dependency or type issues after installing dependencies, try:

```powershell
npm install --legacy-peer-deps
npm install pdfjs-dist --legacy-peer-deps
npm install -D @types/pdf-parse --legacy-peer-deps
```

- If uploads fail, ensure the `./uploads` folder exists and is writable by the process.

## Next improvements (ideas)

- Chunk PDFs and store chunks (or embeddings) so chat queries retrieve only relevant passages (RAG)
- Offload heavy PDF extraction to a background worker to keep uploads responsive
- Add integration tests (file upload + processing + chat usage)

---

Built with ❤️ using NestJS & TypeScript
# SAGE Backend – NestJS Conversion ✨

This is a **complete conversion** of the original Express.js + Mongoose backend into a modern **NestJS TypeScript** application.

## What's Included

### ✅ Core Features
- **Authentication**: JWT-based auth with Passport, register/login endpoints
- **Courses**: Create, list, delete courses with file attachments
- **Chats**: Interactive chat system linked to courses; integrates with Groq LLM
- **Uploads**: File upload middleware using Multer
- **Validation**: DTOs with `class-validator` for request validation
- **Database**: MongoDB + Mongoose with proper schemas and relationships
- **Guards**: JwtAuthGuard protecting all sensitive routes

### 📁 Project Structure
```
src/
├── auth/                 # Authentication module (JWT, Passport, DTOs)
├── chat/                 # Chat module (service, controller, DTO)
├── course/               # Course module (service, controller, DTO)
├── upload/               # File upload module
├── common/               # Groq LLM service
├── schemas/              # Mongoose schemas for User, Course, Chat
├── utils/                # Helper functions
├── app.module.ts         # Root app module
└── main.ts               # Application entry point
```

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
npm install --legacy-peer-deps
```

**Note**: If you encounter permission errors on Windows, try:
```powershell
npm ci --legacy-peer-deps
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
PORT=4000
mongoURI=mongodb+srv://username:password@cluster.mongodb.net/sage-db
JWTKey=your_super_secret_jwt_key_here
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
```

### 3. Run Development Server

```powershell
npm run start:dev
```

Server will start on `http://localhost:4000`

### 4. Build for Production

```powershell
npm run build
npm start
```

## 📚 API Endpoints

### Auth (`/api/auth`)
- `POST /register` – Register new user (public)
- `POST /login` – Login user (public)
- `GET /test` – Test endpoint (requires JWT)

### Courses (`/api/course`)
- `GET /list` – List user's courses (requires JWT)
- `POST /new` – Create new course (requires JWT)
- `DELETE /delete/:id` – Delete course (requires JWT)
- `GET /test` – Test endpoint (requires JWT)

### Chats (`/api/chat`)
- `GET /list/:courseID` – List chats for a course (requires JWT)
- `POST /new` – Create new chat (requires JWT)
- `POST /send` – Send message to Groq AI (requires JWT)
- `DELETE /delete/:id` – Delete chat (requires JWT)
- `GET /test` – Test endpoint (requires JWT)

### Upload (`/api/upload`)
- `POST /doc` – Upload document (requires JWT)
- `GET /test` – Test endpoint (requires JWT)

## 🔐 Authentication

All protected endpoints require a JWT token passed as:
```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained after successful login/registration and expire in 7 days.

## 🛠️ What Changed from Express Version

| Express | NestJS |
|---------|--------|
| Plain Express routes | Nest controllers + services |
| Mongoose models in `/models` | Mongoose schemas in `/schemas` |
| Express middleware | Nest middleware + guards |
| Manual validation | Class-validator DTOs |
| Passport config in `/config` | Nest auth module + JWT strategy |
| Callback-based async | Async/await services |

## 📝 Key Improvements

✅ **Type Safety**: Full TypeScript support across the app  
✅ **Dependency Injection**: NestJS's powerful DI container  
✅ **Modularity**: Clean separation of concerns (Auth, Chat, Course, Upload)  
✅ **Guards & Interceptors**: Built-in request/response handling  
✅ **Validation**: Declarative DTO validation with decorators  
✅ **Error Handling**: Centralized exception filters  
✅ **Testability**: Services easily unit-testable  

## 🧪 Testing

Currently, no test files are included. To add tests:

```powershell
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
```

Then create `.spec.ts` files for your services/controllers.

## 🤝 Next Steps

1. **Run the app** and test endpoints with Postman or cURL
2. **Implement Google OAuth** (route handlers exist, needs frontend redirect)
3. **Add unit tests** for services and controllers
4. **Deploy to production** (Render, Heroku, AWS, etc.)
5. **Refine error responses** to match your frontend expectations

## 📖 Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Hot-reload dev server |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled app (production) |
| `npm test` | Run test suite |
| `npx tsc --noEmit` | Check for TypeScript errors without compiling |

## 🐛 Troubleshooting

**Port already in use?**  
Change the port in `.env` or kill the process on port 4000.

**MongoDB connection refused?**  
Check your `mongoURI` in `.env` and ensure MongoDB is running.

**TypeScript errors after `npm install`?**  
Run `npm install --legacy-peer-deps` to resolve peer dependency conflicts.

---

**Built with ❤️ using NestJS & TypeScript**
