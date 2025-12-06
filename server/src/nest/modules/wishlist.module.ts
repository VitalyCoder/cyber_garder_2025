import { Module } from '@nestjs/common';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { WishlistController } from 'src/presentation/wishlist/wishlist.controller';
import { WishlistService } from 'src/use-cases/wishlist/wishlist.service';

@Module({
  imports: [],
  controllers: [WishlistController],
  providers: [
    {
      provide: 'IWishlistService',
      useClass: WishlistService,
    },
    AiService,
  ],
  exports: ['IWishlistService'],
})
export class WishlistModule {}
