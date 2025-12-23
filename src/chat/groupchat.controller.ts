import { Controller, Get, Post, Delete, Put, Body, Req, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupChatService } from './groupchat.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateGroupChatDto, AddMemberDto, RemoveMemberDto } from './dto/create-groupchat.dto';

@ApiTags('Group Chat')
@ApiBearerAuth('jwt')
@Controller('api/v1/groupchat')
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new group chat' })
  async create(@Body() body: CreateGroupChatDto) {
    return await this.groupChatService.create(body);
  }

  @Get('list/:courseID')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all group chats in a course' })
  async list(@Param('courseID') courseID: string, @Req() req: any) {
    return await this.groupChatService.list(courseID, req.user?.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get group chat details' })
  async getById(@Param('id') id: string, @Req() req: any) {
    return await this.groupChatService.getById(id, req.user?.id);
  }

  @Post('add-member')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add member to group chat' })
  async addMember(@Body() body: AddMemberDto) {
    return await this.groupChatService.addMember(body);
  }

  @Post('remove-member')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove member from group chat' })
  async removeMember(@Body() body: RemoveMemberDto) {
    return await this.groupChatService.removeMember(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update group chat' })
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return await this.groupChatService.updateGroupChat(id, req.user?.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete group chat' })
  async delete(@Param('id') id: string, @Req() req: any) {
    return await this.groupChatService.deleteGroupChat(id, req.user?.id);
  }
}
