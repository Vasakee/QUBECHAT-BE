# SAGE Backend – Quick Reference

## 🚀 Getting Started (5 minutes)

```powershell
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Create .env file
# Copy values from .env.example and fill in your credentials

# 3. Start dev server
npm run start:dev
```

Server running on `http://localhost:4000`

---

## 📝 File Structure Quick Guide

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `src/auth/` | User authentication | `auth.service.ts`, `jwt.strategy.ts`, DTOs |
| `src/course/` | Course management | `course.service.ts`, `course.controller.ts` |
| `src/chat/` | Chat & AI integration | `chat.service.ts`, `groq.service.ts` |
| `src/upload/` | File uploads | `upload.service.ts` |
| `src/schemas/` | MongoDB models | `user.schema.ts`, etc. |

---

## 🔑 Core Concepts

### Controllers
Handle HTTP requests, delegate to services.

```typescript
@Controller('api/course')
export class CourseController {
  constructor(private service: CourseService) {}
  
  @Get('list')
  @UseGuards(JwtAuthGuard)
  list(@Req() req) {
    return this.service.list(req.user.id);
  }
}
```

### Services
Contain business logic, interact with database.

```typescript
@Injectable()
export class CourseService {
  constructor(@InjectModel('courses') private model: Model<any>) {}
  
  list(userId: string) {
    return this.model.find({ creator: userId });
  }
}
```

### Guards
Protect routes (e.g., JWT authentication).

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected-route')
protectedRoute(@Req() req) {
  return { user: req.user };
}
```

### Modules
Bundle controllers, services, and dependencies.

```typescript
@Module({
  imports: [MongooseModule.forFeature([...])],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
```

---

## 🧪 Testing Endpoints

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Protected Route (with token):**
```bash
curl -X GET http://localhost:4000/api/course/list \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## ⚙️ Common Commands

| Command | What it does |
|---------|-------------|
| `npm run start:dev` | Hot-reload dev server |
| `npm run build` | Compile TypeScript → JavaScript |
| `npm start` | Run compiled app |
| `npm test` | Run test suite |
| `npx tsc --noEmit` | Check TypeScript errors without compiling |

---

## 🔐 Authentication

All protected endpoints need:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is returned after login/register. **Expires in 7 days.**

---

## 🐛 Troubleshooting

**Q: `Cannot find module '@nestjs/common'`**  
A: Run `npm install --legacy-peer-deps`

**Q: MongoDB connection error**  
A: Check `mongoURI` in `.env` and ensure MongoDB is accessible

**Q: Port 4000 already in use**  
A: Change `PORT` in `.env` or kill existing process

**Q: TypeScript errors in IDE**  
A: Run `npm install` and reload VS Code

---

## 📂 Adding a New Feature

### 1. Generate a Module
```powershell
npx @nestjs/cli generate module feature-name
npx @nestjs/cli generate service feature-name
npx @nestjs/cli generate controller feature-name
```

### 2. Create Schema (if needed)
```typescript
// src/schemas/feature.schema.ts
@Schema()
export class Feature {
  @Prop()
  name: string;
}
export const FeatureSchema = SchemaFactory.createForClass(Feature);
```

### 3. Register in Module
```typescript
@Module({
  imports: [MongooseModule.forFeature([
    { name: 'features', schema: FeatureSchema }
  ])],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

### 4. Wire Up in AppModule
```typescript
// app.module.ts
@Module({
  imports: [
    FeatureModule,  // Add here
    // ... other modules
  ],
})
export class AppModule {}
```

---

## 🚀 Deployment

### Docker Example
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Variables (Production)
```env
PORT=4000
mongoURI=mongodb+srv://prod_user:prod_pass@prod_cluster.mongodb.net/prod_db
JWTKey=super_secret_key_change_this
GROQ_API_KEY=gsk_...
NODE_ENV=production
```

---

## 📚 Useful Links

- [NestJS Docs](https://docs.nestjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Passport JWT Docs](http://www.passportjs.org/packages/passport-jwt/)
- [Class Validator](https://github.com/typestack/class-validator)

---

**Quick help? Check the READme.md for full documentation!**
