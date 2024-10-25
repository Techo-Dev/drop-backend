import { Controller, Get, Post, Body, Put, Param, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
//import { AuthGuard } from '@nestjs/passport';

import { EmailService } from '../email/email.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly emailService: EmailService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
	  
	  /*
	  const mailTemplate = `
      <h3>Welcome to DropBox!</h3>
      <p>Your account has been successfully created. Here are your login details:</p>
      <ul>
        <li><strong>Username:</strong> ${createUserDto.email}</li>
        <li><strong>Password:</strong> ${createUserDto.password}</li>
      </ul>
      <p>Please keep this information safe and secure.</p>
      <p>We’re excited to have you onboard!</p>
      <br>
      <p>Best regards,<br>The Management Team</p>
     `;
	
	  await this.emailService.sendSimpleEmail(
		  createUserDto.email,
		  'DropBox Account Created',
		  mailTemplate,
	  );
	  */
      return { message: 'User created successfully', user };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(id);
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      return { message: 'User updated successfully', user: updatedUser };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
