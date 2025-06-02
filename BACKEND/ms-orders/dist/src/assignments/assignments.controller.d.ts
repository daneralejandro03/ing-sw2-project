import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Response } from 'express';
import { AssignmentReportData } from '../shared/enums/AssignmentReportData.enum';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    private getTokenFromHeader;
    create(orderId: string, userDeliveryDriver: string, authHeader: string, createAssignmentDto: CreateAssignmentDto): Promise<Assignment>;
    findAll(): Promise<Assignment[]>;
    findOne(id: string): Promise<Assignment>;
    update(id: string, updateData: Partial<CreateAssignmentDto>): Promise<Assignment>;
    remove(id: string): Promise<void>;
    getJsonReportForDriverToday(driverId: string): Promise<AssignmentReportData[]>;
    getCsvReportForDriverToday(driverId: string, res: Response): Promise<void>;
    getPdfReportForDriverToday(driverId: string, res: Response): Promise<void>;
    getExcelReportForDriverToday(driverId: string, res: Response): Promise<void>;
}
