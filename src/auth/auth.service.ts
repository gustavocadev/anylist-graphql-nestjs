import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/inputs/login.input';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  #getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.userService.create(signupInput);

    const token = this.#getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email } = loginInput;
    const user = await this.userService.findOneByEmail(email);

    // Validate password
    if (!(await argon2.verify(user.password, loginInput.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.#getJwtToken(user.id);

    return {
      token,
      user,
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user.isActive) {
      throw new UnauthorizedException('User not active, contact admin');
    }

    delete user.password;

    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.#getJwtToken(user.id);

    return {
      token,
      user,
    };
  }
}
