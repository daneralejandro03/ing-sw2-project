import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
export declare class AssignmentsService {
    private readonly repo;
    constructor(repo: Repository<Assignment>);
    create(dto: CreateAssignmentDto): Promise<Assignment>;
    findAll(): Promise<Assignment[]>;
    findOne(id: string): Promise<Assignment>;
    update(id: string, dto: UpdateAssignmentDto): Promise<Assignment>;
    remove(id: string): Promise<void>;
}
