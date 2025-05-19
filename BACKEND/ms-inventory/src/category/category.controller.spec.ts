import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct dto', () => {
    const dto: CreateCategoryDto = { name: 'Bebidas' };
    const result = { id: 1, ...dto };

    mockCategoryService.create.mockReturnValue(result);
    expect(controller.create(dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all categories', () => {
    const categories = [{ id: 1, name: 'Bebidas' }];
    mockCategoryService.findAll.mockReturnValue(categories);

    expect(controller.findAll()).toEqual(categories);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one category by id', () => {
    const category = { id: 1, name: 'Lácteos' };
    mockCategoryService.findOne.mockReturnValue(category);

    expect(controller.findOne('1')).toEqual(category);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update category', () => {
    const dto: UpdateCategoryDto = { name: 'Snacks' };
    const result = { id: 1, ...dto };

    mockCategoryService.update.mockReturnValue(result);

    expect(controller.update('1', dto)).toEqual(result);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should delete category', () => {
    const result = { deleted: true };
    mockCategoryService.remove.mockReturnValue(result);

    expect(controller.remove('1')).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
