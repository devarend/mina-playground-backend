import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FileSystemTree } from '../../../types';

export class CreateProjectDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsInt()
  @Min(0)
  @Max(1)
  readonly type: number;

  @IsObject()
  @IsOptional()
  readonly fileSystemTree: FileSystemTree;

  @IsString()
  @IsOptional()
  readonly forkedProject: string;

  @IsBoolean()
  readonly visibility: boolean;

  @IsInt()
  readonly files_id: number;
}
