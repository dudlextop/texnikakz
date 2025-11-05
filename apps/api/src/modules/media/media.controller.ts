import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AttachMediaDto } from './dto/attach-media.dto';
import { MediaDto } from './dto/media.dto';
import { PresignMediaDto } from './dto/presign-media.dto';
import { PresignResponseDto } from './dto/presign-response.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  @ApiOkResponse({ type: PresignResponseDto })
  presign(@Body() dto: PresignMediaDto) {
    return this.mediaService.presign(dto);
  }

  @Post('attach')
  @ApiOkResponse({ type: MediaDto })
  attach(@Body() dto: AttachMediaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.attach(dto, user.id);
  }
}
