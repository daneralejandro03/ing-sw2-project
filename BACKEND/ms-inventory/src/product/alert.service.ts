import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MongoDbObject } from './interfaces/mongo-db-object.interface';

import { Product } from './entities/product.entity';
import { EmailService } from '../email/email.service';
import { UserClientService } from '../user-client/user-client.service';
import { CreateEmailDto } from '../email/dto/create-email.dto';
import { RoleClientService } from '../role-client/role-client.service';


@Injectable()
export class AlertService {
    private readonly logger = new Logger(AlertService.name);

    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        private readonly emailService: EmailService,
        private readonly userClientService: UserClientService,
        private readonly roleClientService: RoleClientService,
    ) { }

    async checkStockAndAlert(productId: number, token: string): Promise<void> {
        const product = await this.productRepo.findOne({
            where: { id: productId },
            relations: ['inventory', 'inventory.store'],
        });
        if (!product) {
            this.logger.warn(`AlertService: producto ${productId} no existe`);
            return;
        }
        if (product.stock > product.levelReorder) return;

        this.logger.log(
            `Alerta: producto ${product.id} ("${product.name}") stock ${product.stock} ≤ ${product.levelReorder}`
        );

        const dispatcherRoleId = await this.roleClientService.ensureRole(
            'Dispatcher',
            token
        );

        const userIds = product.inventory
            .map(inv => inv.store?.userId)
            .filter((uid): uid is string => !!uid);
        const uniqueUserIds = Array.from(new Set(userIds));
        if (uniqueUserIds.length === 0) {
            this.logger.warn(
                `Producto ${product.id} no tiene usuarios asignados a tiendas.`
            );
            return;
        }

        await Promise.all(
            uniqueUserIds.map(async userId => {
                try {
                    const user = await this.userClientService.findOne(userId, token);
                    if (!user?.email) {
                        this.logger.warn(`Usuario ${userId} sin email, se omite.`);
                        return;
                    }

                    const userRoleId = typeof user.role === 'string'
                        ? user.role
                        : (user.role && typeof user.role === 'object')
                            ? ((user.role as MongoDbObject)._id || (user.role as MongoDbObject).$oid || '')
                            : '';

                    if (userRoleId !== dispatcherRoleId) {
                        this.logger.log(
                            `Usuario ${userId} no es Dispatcher (rol ${JSON.stringify(
                                user.role
                            )}), se omite.`
                        );
                        return;
                    }

                    const emailDto: CreateEmailDto = {
                        address: user.email,
                        subject: `Alerta stock bajo: ${product.name}`,
                        plainText:
                            `El producto "${product.name}" (ID:${product.id}) tiene stock ${product.stock
                            }, nivel de reorden ${product.levelReorder}. Por favor repón inventario.`,
                    };

                    await this.emailService.sendMail(emailDto);
                    this.logger.log(`Correo de alerta enviado a ${user.email}`);
                } catch (err: any) {
                    this.logger.error(
                        `Error al notificar usuario ${userId}: ${err}`
                    );
                }
            })
        );
    }
}