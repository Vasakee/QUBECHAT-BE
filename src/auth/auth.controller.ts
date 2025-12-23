import { Body, Controller, Get, Post, UseGuards, Req, Res, Options } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Test authentication' })
  @ApiResponse({ status: 200, description: 'Authentication working' })
  test() {
    return { msg: 'Auth Works!' };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async register(@Body() body: RegisterDto, @Req() req: any) {
    return this.authService.register(body, req);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive a JWT' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login' })
  async googleAuth() {
    // Passport handles the redirect to Google
  }

  @Options('google')
  @ApiOperation({ summary: 'CORS preflight for Google auth' })
  async googleAuthOptions() {
    return {};
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Returns JWT token and user info' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = req.user as any;
    const token = result?.token || '';
    const user = result?.user || {};
    
    // Check if request is from browser or API client
    if (req.query.redirect === 'false' || req.headers['accept']?.includes('application/json')) {
      // Return JSON for API clients
      return res.json({
        reply: 'Success',
        token,
        user,
      });
    }
    
    // Redirect to frontend with token in hash for browser-based flow
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`
    );
  }
}