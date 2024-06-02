import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class MovieCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  minAge: number;
}
