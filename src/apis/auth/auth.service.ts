import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../core/database/prisma.service";
import { messages } from "../../common/messages";
import { BCRYPT_SALT_ROUNDS } from "../../common/constants";
import { LoginDTO, RegisterDTO } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDTO: RegisterDTO) {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: registerDTO.email },
      });
      if (existing) {
        throw new BadRequestException(messages.auth.emailAlreadyExists);
      }

      const password = await bcrypt.hash(registerDTO.password, BCRYPT_SALT_ROUNDS);
      const user = await this.prisma.user.create({
        data: { ...registerDTO, password },
      });

      return this.sanitize(user);
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message);
    }
  }

  async login(loginDTO: LoginDTO) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDTO.email },
      });
      if (!user || !(await bcrypt.compare(loginDTO.password, user.password))) {
        throw new UnauthorizedException(messages.auth.invalidCredentials);
      }

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken, user: this.sanitize(user) };
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message);
    }
  }

  private sanitize(user: User) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
