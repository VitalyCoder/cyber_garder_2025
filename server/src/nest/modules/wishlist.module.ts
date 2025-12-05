import { Module } from '@nestjs/common';
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
  ],
  exports: ['IWishlistService'],
})
export class WishlistModule {}
