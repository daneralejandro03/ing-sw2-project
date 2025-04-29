import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { TwoFactorDto } from './dto/two-factor.dto';
import { ToggleTwoFactorDto } from './dto/toggle-two-factor.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyCodeDto) {
    return this.authService.verify(dto);
  }

  @Post('resend')
  resend(@Body() dto: ResendCodeDto) {
    return this.authService.resend(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req, @Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('2fa')
  twoFactor(@Body() dto: TwoFactorDto) {
    return this.authService.twoFactor(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/toggle')
  toggleTwoFactor(@Body() dto: ToggleTwoFactorDto) {
    return this.authService.toggleTwoFactor(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  changePassword(
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
