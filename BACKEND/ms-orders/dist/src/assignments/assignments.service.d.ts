import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Order } from 'src/orders/entities/order.entity';
import { AssignmentReportData } from '../shared/enums/AssignmentReportData.enum';
export declare class AssignmentsService {
    private readonly assignmentRepo;
    private readonly orderRepo;
    private readonly httpService;
    constructor(assignmentRepo: Repository<Assignment>, orderRepo: Repository<Order>, httpService: HttpService);
    create(orderId: string, userDeliveryDriver: string, createAssignmentDto: CreateAssignmentDto, authToken: string): Promise<Assignment>;
    findAll(): Promise<Assignment[]>;
    findOne(id: string): Promise<Assignment>;
    update(id: string, updateData: Partial<CreateAssignmentDto>): Promise<Assignment>;
    remove(id: string): Promise<void>;
    getAssignmentsForReportByDriverAndDate(driverId: string, targetDate: Date): Promise<AssignmentReportData[]>;
    generatePdfReportForDriver(driverId: string, targetDate: Date): Promise<Buffer>;
    private generatePdfFromData;
    generateExcelReportForDriver(driverId: string, targetDate: Date): Promise<Buffer>;
    convertToCsv(data: AssignmentReportData[]): string;
}
