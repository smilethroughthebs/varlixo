import { Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser('sub') userId: string,
    @Query('unreadOnly') unreadOnly: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('skip') skip: string | undefined,
  ) {
    const unread = unreadOnly === 'true' || unreadOnly === '1';
    const notifications = await this.notificationsService.list(userId, {
      unreadOnly: unread,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
    });

    const unreadCount = await this.notificationsService.unreadCount(userId);

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    };
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const unreadCount = await this.notificationsService.unreadCount(userId);
    return { success: true, data: { unreadCount } };
  }

  @Put(':id/read')
  async markRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const notification = await this.notificationsService.markRead(userId, id);
    return { success: true, data: { notification } };
  }

  @Put('read-all')
  async markAllRead(@CurrentUser('sub') userId: string) {
    await this.notificationsService.markAllRead(userId);
    return { success: true };
  }

  @Delete(':id')
  async deleteOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.notificationsService.delete(userId, id);
    return { success: true };
  }

  @Delete()
  async clearAll(@CurrentUser('sub') userId: string) {
    await this.notificationsService.clearAll(userId);
    return { success: true };
  }
}
