import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    return user.role == UserRole.MANAGER;
  }
}
