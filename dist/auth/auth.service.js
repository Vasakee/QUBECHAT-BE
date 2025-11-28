"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const util_1 = require("../utils/util");
let AuthService = class AuthService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async register(body) {
        // simple validation left to original validators
        const avatar = (body.req && body.req.protocol)
            ? (0, util_1.getServerAddress)(body.req) + '/images/user_placeholder.png'
            : (body.avatar || '/images/user_placeholder.png');
        const newUser = new this.userModel({
            username: body.username,
            email: body.email,
            password: body.password,
            avatar,
            date: Date.now(),
        });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
        try {
            const user = await newUser.save();
            const payload = { id: user.id, username: user.username, avatar: user.avatar, email: user.email };
            const token = jwt.sign(payload, process.env.JWTKey || 'secret', { expiresIn: 604800 });
            return { reply: 'Success', token: 'Bearer ' + token, user: payload };
        }
        catch (error) {
            if (error.code === 11000) {
                if (error.keyPattern && error.keyPattern.email) {
                    return { status: 400, errors: { email: 'Email already exists' } };
                }
                if (error.keyPattern && error.keyPattern.username) {
                    return { status: 400, errors: { username: 'Username already exists' } };
                }
            }
            return { status: 500, error: error.message };
        }
    }
    async login(body) {
        const { email, password } = body;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            return { status: 404, errors: { email: 'Email not found' } };
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const payload = { id: user.id, username: user.username, avatar: user.avatar, email: user.email };
            const token = jwt.sign(payload, process.env.JWTKey || 'secret', { expiresIn: 604800 });
            return { reply: 'Success', token: 'Bearer ' + token, user: payload };
        }
        return { status: 400, errors: { password: 'Password not correct' } };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('users')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map