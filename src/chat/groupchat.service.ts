import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupChatDocument } from '../schemas/groupchat.schema';
import { CreateGroupChatDto, AddMemberDto, RemoveMemberDto } from './dto/create-groupchat.dto';
import { default as mongoose } from 'mongoose';

const MAX_GROUP_MEMBERS = 5;

@Injectable()
export class GroupChatService {
  constructor(
    @InjectModel('groupchats') private groupChatModel: Model<GroupChatDocument>,
  ) {}

  async create(body: CreateGroupChatDto) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Ensure members array unique and includes creator
      const membersSet = new Set((body.members || []).map((m: any) => m.toString()));
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
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error.code === 11000) {
        return { status: 400, error: 'Duplicate group chat' };
      }
      return { status: 500, error: error.message };
    }
  }

  async list(courseID: string, userID: string) {
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
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  async getById(id: string, userId: string) {
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
      const isMember = groupChat.members.some((m: any) => m._id.toString() === userId);
      if (!isMember && groupChat.creator._id.toString() !== userId) {
        return { status: 403, error: 'Access denied' };
      }

      return { message: 'success', groupChat };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  async addMember(data: AddMemberDto) {
    try {
      const groupChat = await this.groupChatModel.findById(data.groupChatId);
      if (!groupChat) {
        return { status: 404, error: 'Group chat not found' };
      }

      // Prevent duplicates
      const currentMembers = groupChat.members.map((m: any) => m.toString());
      if (currentMembers.includes(data.userId.toString())) {
        // Already member - return current state
        const populated = await this.groupChatModel.findByIdAndUpdate(
          data.groupChatId,
          { $addToSet: { members: data.userId } },
          { new: true },
        ).populate('members', 'username avatar');
        return { message: 'Member added successfully', groupChat: populated };
      }

      if (currentMembers.length >= MAX_GROUP_MEMBERS) {
        return { status: 400, error: `Group cannot have more than ${MAX_GROUP_MEMBERS} members` };
      }

      const updated = await this.groupChatModel.findByIdAndUpdate(
        data.groupChatId,
        { $addToSet: { members: data.userId } },
        { new: true },
      ).populate('members', 'username avatar');

      if (!updated) {
        return { status: 404, error: 'Group chat not found' };
      }

      return { message: 'Member added successfully', groupChat: updated };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  async removeMember(data: RemoveMemberDto) {
    try {
      const groupChat = await this.groupChatModel.findByIdAndUpdate(
        data.groupChatId,
        { $pull: { members: data.userId } },
        { new: true },
      ).populate('members', 'username avatar');

      if (!groupChat) {
        return { status: 404, error: 'Group chat not found' };
      }

      return { message: 'Member removed successfully', groupChat };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  async addMessage(groupChatId: string, message: any) {
    try {
      const groupChat = await this.groupChatModel.findByIdAndUpdate(
        groupChatId,
        {
          $push: { messages: message },
          $set: { lastMessageAt: new Date() },
        },
        { new: true },
      ).populate('messages.sender', 'username avatar');

      return { message: 'Message added successfully', groupChat };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  async deleteGroupChat(id: string, userId: string) {
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
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  async updateGroupChat(id: string, userId: string, updates: any) {
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
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }
}
