import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

// this is for GraphQL
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Override
  getRequest(ctx: ExecutionContext) {
    const context = GqlExecutionContext.create(ctx);
    const request = context.getContext().req;

    return request;
  }
}
