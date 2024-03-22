import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { validRoles } from '../enums/valid-roles.enum';

export const CurrentUser = createParamDecorator(
  (roles: validRoles[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'User not found -  make sure that we used the AuthGuard',
      );
    }

    if (roles.length === 0) {
      return user;
    }

    for (const role of user.roles) {
      if (roles.includes(role)) {
        return user;
      }
    }

    throw new ForbiddenException(
      `You do not have permission to access this resource, you need [${[
        roles,
      ]}] role`,
    );
  },
);
