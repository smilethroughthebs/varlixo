/**
 * ==============================================
 * VARLIXO - ADMIN GUARD
 * ==============================================
 * Protects admin-only routes.
 * Validates both admin role and admin secret route.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../schemas/user.schema';
import { getClientIp } from '../utils/helpers';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is authenticated
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has admin role
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    // Optional IP allowlist for admin routes
    const allowlistRaw = this.configService.get<string>('admin.ipAllowlist') || process.env.ADMIN_IP_ALLOWLIST;
    if (allowlistRaw) {
      const allowlist = String(allowlistRaw)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const ip = getClientIp(request);
      if (ip && allowlist.length > 0 && !allowlist.includes(ip)) {
        throw new ForbiddenException('Admin access not allowed from this IP');
      }
    }

    // Require 2FA for admin routes (TOTP must be verified at login)
    // Jwt payload includes `twoFactorAuthenticated` set by AuthService.login.
    if (!user.twoFactorAuthenticated) {
      throw new ForbiddenException('Admin access requires two-factor authentication');
    }

    return true;
  }
}




