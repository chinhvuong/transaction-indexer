import { plainToClass, Transform } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsString,
  Max,
  Min,
  IsOptional,
  validateSync,
} from 'class-validator';

export class EnvironmentConfig {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: 'development' | 'production' | 'test' = 'development';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  DB_HOST: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1000) // Minimum 1 second
  ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1000) // Minimum 1 second
  REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS: number;

  @IsString()
  REDIS_URL: string;

  @IsString()
  REDIS_HOST: string = 'localhost';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number = 6379;

  @IsOptional()
  @IsString()
  ETHEREUM_RPC_URLS?: string;

  @IsOptional()
  @IsString()
  POLYGON_RPC_URLS?: string;

  @IsOptional()
  @IsString()
  BSC_RPC_URLS?: string;

  @IsOptional()
  @IsString()
  SEPOLIA_RPC_URLS?: string;

  @IsOptional()
  @IsString()
  BSC_TESTNET_RPC_URLS?: string;
}

// Export the type for use throughout the application
export type EnvConfig = EnvironmentConfig;

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed: ${errors
        .map(
          (error) =>
            `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`,
        )
        .join('; ')}`,
    );
  }

  return validatedConfig;
}
