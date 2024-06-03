import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('ping')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Ping endpoint for health check' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  ping(): string {
    return 'pong';
  }
}
