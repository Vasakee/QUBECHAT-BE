# NestJS Conversion Guide – SAGE Backend

## Overview

This document details the conversion of the original Express.js backend to a **NestJS (TypeScript)** architecture. The conversion maintains feature parity while adding type safety, dependency injection, and better code organization.

---

## 📦 Dependency Changes

### Removed (Express-specific)
- `express` – Replaced by NestJS
- `body-parser` – Built into NestJS
- `bcrypt` – Replaced with `bcryptjs`
- `connect-ensure-login` – Not needed with NestJS guards

### Added (NestJS Stack)
```json
{
  "@nestjs/common": "^10.1.2",
  "@nestjs/core": "^10.1.2",
  "@nestjs/platform-express": "^10.1.2",
  "@nestjs/mongoose": "^10.0.3",
  "@nestjs/passport": "^10.0.2",
  "@nestjs/jwt": "^10.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "typescript": "^5.1.6",
  "ts-node-dev": "^2.0.0",
  "reflect-metadata": "^0.1.13",
  "rxjs": "^7.8.1"
}
```

---

## 🏗️ Architecture Mapping

### Before (Express)
```
routes/
  └── api/
      ├── auth.js      (express Router)
      ├── course.js    (express Router)
      ├── chat.js      (express Router)
      └── upload.js    (express Router)

models/
  ├── User.js          (Mongoose schema)
  ├── Course.js
  └── Chat.js

config/
  ├── passport.js      (Passport strategies)
  └── groq.js          (Groq client)

server.js             (Express app setup)
```

### After (NestJS)
```
src/
  ├── auth/
  │   ├── auth.module.ts
  │   ├── auth.controller.ts
  │   ├── auth.service.ts
  │   ├── jwt.strategy.ts
  │   ├── jwt-auth.guard.ts
  │   └── dto/
  │       ├── register.dto.ts
  │       └── login.dto.ts
  │
  ├── course/
  │   ├── course.module.ts
  │   ├── course.controller.ts
  │   ├── course.service.ts
  │   └── dto/
  │       └── create-course.dto.ts
  │
  ├── chat/
  │   ├── chat.module.ts
  │   ├── chat.controller.ts
  │   ├── chat.service.ts
  │   └── dto/
  │       └── create-chat.dto.ts
  │
  ├── upload/
  │   ├── upload.module.ts
  │   ├── upload.controller.ts
  │   └── upload.service.ts
  │
  ├── common/
  │   ├── groq.module.ts
  │   └── groq.service.ts
  │
  ├── schemas/
  │   ├── user.schema.ts
  │   ├── course.schema.ts
  │   └── chat.schema.ts
  │
  ├── utils/
  │   └── util.ts
  │
  ├── app.module.ts    (Root module)
  └── main.ts          (Bootstrap)
```

---

## 🔄 Code Migration Examples

### 1. Models → Schemas

**Before (Express + Mongoose):**
```javascript
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'courses' }],
  avatar: { type: String, required: true },
  date: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('users', UserSchema);
```

**After (NestJS):**
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'courses' }] })
  courses: Types.ObjectId[];

  @Prop({ required: true })
  avatar: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 2. Routes → Controllers

**Before (Express):**
```javascript
const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  // validation
  const newUser = new User({...});
  newUser.save().then(user => res.json({...}));
});

module.exports = router;
```

**After (NestJS):**
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }
}
```

### 3. Business Logic → Services

**Before (Express – inline in routes):**
```javascript
router.post('/register', (req, res) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const user = new User({ password: hash });
      user.save().then(user => res.json({...}));
    });
  });
});
```

**After (NestJS – separated in services):**
```typescript
@Injectable()
export class AuthService {
  constructor(@InjectModel('users') private userModel: Model<any>) {}

  async register(body: RegisterDto) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const newUser = new this.userModel({
      ...body,
      password: hashedPassword
    });
    return await newUser.save();
  }
}
```

### 4. Passport → JWT Strategy + Guard

**Before (Express):**
```javascript
// config/passport.js
passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  User.findById(jwt_payload.id).then(user => {
    if(user) return done(null, user);
    return done(null, false);
  });
}));

// routes/auth.js
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({msg: 'Auth Works!'});
});
```

**After (NestJS):**
```typescript
// auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel('users') private userModel: Model<any>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWTKey
    });
  }

  async validate(payload: any) {
    return await this.userModel.findById(payload.id);
  }
}

// auth/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// auth/auth.controller.ts
@Controller('api/auth')
export class AuthController {
  @Get('test')
  @UseGuards(JwtAuthGuard)
  test() {
    return { msg: 'Auth Works!' };
  }
}
```

### 5. Validation – DTOs with Decorators

**Before (Express – manual validation functions):**
```javascript
// validation/register.js
module.exports = function validateRegisterInput(data) {
  const errors = {};
  if (!validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
};

// routes/auth.js
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) return res.status(400).json({errors});
});
```

**After (NestJS – class-validator DTOs):**
```typescript
// auth/dto/register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

// auth/auth.controller.ts
@Post('register')
async register(@Body() body: RegisterDto) {
  // Validation is automatic via ValidationPipe
  return await this.authService.register(body);
}

// app.module.ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

---

## 🔐 Authentication Flow

### JWT Generation
```typescript
// Before: callback-based
jwt.sign(payload, JWTKey, { expiresIn: 604800 }, (err, token) => {
  res.json({ token: 'Bearer ' + token });
});

// After: async/await
const token = jwt.sign(payload, JWTKey, { expiresIn: 604800 });
return { token: 'Bearer ' + token };
```

### Protected Routes
```typescript
@UseGuards(JwtAuthGuard)
@Get('list')
async list(@Req() req) {
  // req.user is populated by JwtStrategy.validate()
  return this.courseService.list(req.user.id);
}
```

---

## 📡 HTTP Methods & Status Codes

| Endpoint | Method | Auth | Status | Change |
|----------|--------|------|--------|--------|
| `/api/auth/register` | POST | ❌ | 200/400 | No change |
| `/api/auth/login` | POST | ❌ | 200/404 | No change |
| `/api/auth/test` | GET | ✅ | 200 | **Now requires JWT** |
| `/api/course/list` | GET | ✅ | 200 | **Guard added** |
| `/api/course/new` | POST | ✅ | 200/400 | **Guard added** |
| `/api/course/delete/:id` | DELETE | ✅ | 200/404 | **Guard added** |
| `/api/chat/list/:courseID` | GET | ✅ | 200 | **Guard added** |
| `/api/chat/new` | POST | ✅ | 200/400 | **Guard added** |
| `/api/chat/send` | POST | ✅ | 200 | **Guard added** |
| `/api/chat/delete/:id` | DELETE | ✅ | 200/404 | **Guard added** |
| `/api/upload/doc` | POST | ✅ | 200 | **Guard added** |

---

## 🚀 Development Workflow

### Running Locally
```bash
npm install --legacy-peer-deps
npm run start:dev
```

### Development vs. Production
```bash
# Dev: TypeScript hot-reload via ts-node-dev
npm run start:dev

# Prod: Compile and run plain Node.js
npm run build
npm start
```

### Environment Variables
Create `.env`:
```
PORT=4000
mongoURI=mongodb://...
JWTKey=secret123
GROQ_API_KEY=...
```

---

## ✅ Feature Parity Checklist

| Feature | Express | NestJS | Status |
|---------|---------|--------|--------|
| User registration | ✅ | ✅ | ✅ Complete |
| User login | ✅ | ✅ | ✅ Complete |
| JWT auth | ✅ | ✅ | ✅ Complete |
| Course CRUD | ✅ | ✅ | ✅ Complete |
| Chat CRUD | ✅ | ✅ | ✅ Complete |
| Groq integration | ✅ | ✅ | ✅ Complete |
| File upload | ✅ | ✅ | ✅ Complete |
| Google OAuth | ⚠️ | ⚠️ | 🔄 Needs frontend |
| Validation | ✅ | ✅ | ✅ Complete |

---

## 🎯 Next Steps

1. **Test the API** with Postman or cURL
2. **Wire up the frontend** – Ensure CORS is enabled (it is)
3. **Implement Google OAuth callbacks** if needed
4. **Add unit tests** with Jest
5. **Deploy to production** (Render, Railway, AWS, etc.)

---

## 📖 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Mongoose Integration](https://docs.nestjs.com/techniques/database)
- [Passport.js Strategy](https://www.passportjs.org/packages/passport-jwt/)
- [Class Validator](https://github.com/typestack/class-validator)

---

**Conversion completed with ❤️ using NestJS v10 & TypeScript**
