import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @Post('departament/:departamentId')
  create(
    @Param('departamentId') departamentId: string,
    @Body() createCityDto: CreateCityDto,
  ): Promise<City> {
    return this.cityService.create(+departamentId, createCityDto);
  }

  @Get()
  findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.cityService.update(+id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cityService.remove(+id);
  }

  @Get('departament/:departamentId')
  findByDepartament(@Param('departamentId') departamentId: string) {
    return this.cityService.findByDepartament(+departamentId);
  }
}
