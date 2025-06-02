import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  Res,
  HttpCode,
  HttpStatus,
  Delete,
  Patch,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiProduces,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AssignmentReportData } from '../shared/enums/AssignmentReportData.enum';
import { UseGuards } from '@nestjs/common';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) { }

  private getTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o con formato incorrecto.');
    }
    return authHeader.substring(7);
  }

  @Post('order/:orderId/DeliveryDriver/:userDeliveryDriver')
  @ApiOperation({ summary: 'Crear nueva asignación de repartidor para una orden' })
  @ApiParam({ name: 'orderId', type: String, description: 'ID de la orden' })
  @ApiParam({ name: 'userDeliveryDriver', type: String, description: 'ID del repartidor' })
  @ApiBody({ type: CreateAssignmentDto, description: 'Datos de la asignación' })
  @ApiResponse({ status: 201, description: 'Asignación creada exitosamente.', type: Assignment })
  @ApiResponse({ status: 400, description: 'Datos inválidos o recurso no encontrado.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  async create(
    @Param('orderId') orderId: string,
    @Param('userDeliveryDriver') userDeliveryDriver: string,
    @Headers('authorization') authHeader: string,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    const token = this.getTokenFromHeader(authHeader);
    return this.assignmentsService.create(
      orderId,
      userDeliveryDriver,
      createAssignmentDto,
      `Bearer ${token}`,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las asignaciones' })
  @ApiResponse({ status: 200, description: 'Listado de asignaciones.', type: [Assignment] })
  async findAll(): Promise<Assignment[]> {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada.', type: Assignment })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async findOne(@Param('id') id: string): Promise<Assignment> {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación existente' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la asignación a actualizar' })
  @ApiBody({ type: CreateAssignmentDto, description: 'Campos a actualizar' })
  @ApiResponse({ status: 200, description: 'Asignación actualizada.', type: Assignment })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Asignación no existente.' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateAssignmentDto>,
  ): Promise<Assignment> {
    return this.assignmentsService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una asignación por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la asignación a eliminar' })
  @ApiResponse({ status: 204, description: 'Asignación eliminada.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.assignmentsService.remove(id);
  }

  @Get('reports/driver/:driverId/today/json')
  @ApiOperation({ summary: 'Obtener reporte JSON de asignaciones de un repartidor para la fecha actual' })
  @ApiParam({ name: 'driverId', description: 'ID del repartidor', type: String })
  @ApiResponse({ status: 200, description: 'Datos del reporte en JSON.', type: Object })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getJsonReportForDriverToday(
    @Param('driverId') driverId: string,
  ): Promise<AssignmentReportData[]> {
    const today = new Date();
    return this.assignmentsService.getAssignmentsForReportByDriverAndDate(driverId, today);
  }

  @Get('reports/driver/:driverId/today/csv')
  @ApiOperation({ summary: 'Descargar reporte CSV de asignaciones de un repartidor para la fecha actual' })
  @ApiParam({ name: 'driverId', description: 'ID del repartidor', type: String })
  @ApiResponse({ status: 200, description: 'Archivo CSV con el reporte.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiProduces('text/csv')
  async getCsvReportForDriverToday(
    @Param('driverId') driverId: string,
    @Res() res: Response,
  ): Promise<void> {
    const today = new Date();
    const reportData = await this.assignmentsService.getAssignmentsForReportByDriverAndDate(driverId, today);
    if (reportData.length === 0) {
      res.setHeader('Content-Type', 'text/plain');
      res.status(HttpStatus.OK).send('No hay asignaciones para reportar para este repartidor en la fecha actual.');
      return;
    }
    const csvData = this.assignmentsService.convertToCsv(reportData);
    const fileNameDate = today.toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte_asignaciones_${driverId}_${fileNameDate}.csv`,
    );
    res.status(HttpStatus.OK).send(csvData);
  }

  @Get('reports/driver/:driverId/today/pdf')
  @ApiOperation({ summary: 'Descargar reporte PDF de asignaciones de un repartidor para la fecha actual' })
  @ApiParam({ name: 'driverId', description: 'ID del repartidor', type: String })
  @ApiResponse({ status: 200, description: 'Archivo PDF con el reporte.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiProduces('application/pdf')
  async getPdfReportForDriverToday(
    @Param('driverId') driverId: string,
    @Res() res: Response,
  ): Promise<void> {
    const today = new Date();
    try {
      const pdfBuffer = await this.assignmentsService.generatePdfReportForDriver(driverId, today);
      const fileNameDate = today.toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte_asignaciones_${driverId}_${fileNameDate}.pdf`,
      );
      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error interno al generar el reporte PDF.' });
      }
    }
  }

  @Get('reports/driver/:driverId/today/excel')
  @ApiOperation({ summary: 'Descargar reporte Excel de asignaciones de un repartidor para la fecha actual' })
  @ApiParam({ name: 'driverId', description: 'ID del repartidor', type: String })
  @ApiResponse({ status: 200, description: 'Archivo Excel con el reporte.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async getExcelReportForDriverToday(
    @Param('driverId') driverId: string,
    @Res() res: Response,
  ): Promise<void> {
    const today = new Date();
    try {
      const excelBuffer = await this.assignmentsService.generateExcelReportForDriver(driverId, today);
      const fileNameDate = today.toISOString().split('T')[0];
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte_asignaciones_${driverId}_${fileNameDate}.xlsx`,
      );
      res.status(HttpStatus.OK).send(excelBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error interno al generar el reporte Excel.' });
    }
  }
}
