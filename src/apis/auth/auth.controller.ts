import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { JoiValidationPipe } from "../../core/pipes/joi-validation.pipe";
import { ResponseUtil } from "../../core/utils/response.util";
import { Response } from "../../common/types/response.types";
import { messages } from "../../common/messages";
import { AuthService } from "./auth.service";
import { LoginDTO, LoginSchema, RegisterDTO, RegisterSchema } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @UsePipes(new JoiValidationPipe(RegisterSchema))
  async register(@Body() registerDTO: RegisterDTO): Promise<Response> {
    const result = await this.authService.register(registerDTO);
    return ResponseUtil.created(result, messages.auth.registeredSuccessfully);
  }

  @Post("login")
  @UsePipes(new JoiValidationPipe(LoginSchema))
  async login(@Body() loginDTO: LoginDTO): Promise<Response> {
    const result = await this.authService.login(loginDTO);
    return ResponseUtil.ok(result, messages.auth.loggedInSuccessfully);
  }
}
