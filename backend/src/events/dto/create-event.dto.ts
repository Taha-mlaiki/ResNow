import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string = '';

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string = '';

  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string = '';

  @IsDateString({}, { message: 'End date must be a valid ISO 8601 date' })
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string = '';

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  @MaxLength(500, { message: 'Location must not exceed 500 characters' })
  location: string = '';

  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity: number = 0;
}
