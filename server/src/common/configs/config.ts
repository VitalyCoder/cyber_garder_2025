import { ConfigModuleOptions } from '@nestjs/config';

export const config: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
  expandVariables: true,
  envFilePath: '.env',
};
