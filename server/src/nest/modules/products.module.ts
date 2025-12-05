import { Module } from '@nestjs/common';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { PrismaModule } from 'src/infrastructure/db/prisma.module';
import { ProductsController } from 'src/presentation/products/products.controller';
import { BlacklistService } from 'src/use-cases/blacklist/blacklist.service';
import { CoolingRangeService } from 'src/use-cases/cooling-range/coolingRange.service';
import { ProductsService } from 'src/use-cases/products/products.service';
import { UsersService } from 'src/use-cases/users/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    UsersService,
    BlacklistService,
    CoolingRangeService,
    AiService,
  ],
})
export class ProductsModule {}
