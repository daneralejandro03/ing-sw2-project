import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AccessService } from './access.service';
//import { CreateAccessDto } from './dto/create-access.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AccessGuard } from '../guards/access.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), AccessGuard)
@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) { }

  @Post('permission/:permissionId/role/:roleId')
  create(
    @Param('permissionId') permissionId: string,
    @Param('roleId') roleId: string,
  ) {
    const accessDto = { permission: permissionId, role: roleId };
    return this.accessService.create(accessDto);
  }

  @Get()
  findAll() {
    return this.accessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccessDto: UpdateAccessDto) {
    return this.accessService.update(id, updateAccessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessService.remove(id);
  }
}
