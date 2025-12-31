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
exports.GroupChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = __importDefault(require("mongoose"));
const MAX_GROUP_MEMBERS = 5;
let GroupChatService = class GroupChatService {
    constructor(groupChatModel) {
        this.groupChatModel = groupChatModel;
    }
    async create(body) {
        const session = await mongoose_3.default.startSession();
        session.startTransaction();
        try {
            // Ensure members array unique and includes creator
            const membersSet = new Set((body.members || []).map((m) => m.toString()));
            membersSet.add(body.creator.toString());
            const members = Array.from(membersSet);
            if (members.length > MAX_GROUP_MEMBERS) {
                return { status: 400, error: `Group cannot have more than ${MAX_GROUP_MEMBERS} members` };
            }
            const newGroupChat = new this.groupChatModel({
                name: body.name,
                description: body.description,
                creator: body.creator,
                members,
                course: body.course,
                avatar: body.avatar,
                isActive: true,
                messages: [],
            });
            const savedGroupChat = await newGroupChat.save({ session });
            await session.commitTransaction();
            session.endSession();
            return { message: 'success', groupChat: savedGroupChat };
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error.code === 11000) {
                return { status: 400, error: 'Duplicate group chat' };
            }
            return { status: 500, error: error.message };
        }
    }
    async list(courseID, userID) {
        try {
            const groupChats = await this.groupChatModel
                .find({
                course: courseID,
                members: userID,
            })
                .populate('members', 'username avatar')
                .populate('creator', 'username')
                .sort({ lastMessageAt: -1 });
            return { message: 'success', groupChats };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    async getById(id, userId) {
        try {
            const groupChat = await this.groupChatModel
                .findById(id)
                .populate('members', 'username avatar email')
                .populate('creator', 'username')
                .populate('messages.sender', 'username avatar');
            if (!groupChat) {
                return { status: 404, error: 'Group chat not found' };
            }
            // Verify user is a member
            const isMember = groupChat.members.some((m) => m._id.toString() === userId);
            if (!isMember && groupChat.creator._id.toString() !== userId) {
                return { status: 403, error: 'Access denied' };
            }
            return { message: 'success', groupChat };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    async addMember(data) {
        try {
            const groupChat = await this.groupChatModel.findById(data.groupChatId);
            if (!groupChat) {
                return { status: 404, error: 'Group chat not found' };
            }
            // Prevent duplicates
            const currentMembers = groupChat.members.map((m) => m.toString());
            if (currentMembers.includes(data.userId.toString())) {
                // Already member - return current state
                const populated = await this.groupChatModel.findByIdAndUpdate(data.groupChatId, { $addToSet: { members: data.userId } }, { new: true }).populate('members', 'username avatar');
                return { message: 'Member added successfully', groupChat: populated };
            }
            if (currentMembers.length >= MAX_GROUP_MEMBERS) {
                return { status: 400, error: `Group cannot have more than ${MAX_GROUP_MEMBERS} members` };
            }
            const updated = await this.groupChatModel.findByIdAndUpdate(data.groupChatId, { $addToSet: { members: data.userId } }, { new: true }).populate('members', 'username avatar');
            if (!updated) {
                return { status: 404, error: 'Group chat not found' };
            }
            return { message: 'Member added successfully', groupChat: updated };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    async removeMember(data) {
        try {
            const groupChat = await this.groupChatModel.findByIdAndUpdate(data.groupChatId, { $pull: { members: data.userId } }, { new: true }).populate('members', 'username avatar');
            if (!groupChat) {
                return { status: 404, error: 'Group chat not found' };
            }
            return { message: 'Member removed successfully', groupChat };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    async addMessage(groupChatId, message) {
        try {
            const groupChat = await this.groupChatModel.findByIdAndUpdate(groupChatId, {
                $push: { messages: message },
                $set: { lastMessageAt: new Date() },
            }, { new: true }).populate('messages.sender', 'username avatar');
            return { message: 'Message added successfully', groupChat };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    async deleteGroupChat(id, userId) {
        try {
            const groupChat = await this.groupChatModel.findById(id);
            if (!groupChat) {
                return { status: 404, error: 'Group chat not found' };
            }
            // Only creator can delete
            if (groupChat.creator.toString() !== userId) {
                return { status: 403, error: 'Only creator can delete this group chat' };
            }
            await this.groupChatModel.findByIdAndDelete(id);
            return { message: 'Group chat deleted successfully' };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
    async updateGroupChat(id, userId, updates) {
        try {
            const groupChat = await this.groupChatModel.findById(id);
            if (!groupChat) {
                return { status: 404, error: 'Group chat not found' };
            }
            // Only creator can update
            if (groupChat.creator.toString() !== userId) {
                return { status: 403, error: 'Only creator can update this group chat' };
            }
            const updated = await this.groupChatModel.findByIdAndUpdate(id, updates, {
                new: true,
            });
            return { message: 'Group chat updated successfully', groupChat: updated };
        }
        catch (error) {
            return { status: 500, error: error.message };
        }
    }
};
exports.GroupChatService = GroupChatService;
exports.GroupChatService = GroupChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('groupchats')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GroupChatService);
//# sourceMappingURL=groupchat.service.js.map