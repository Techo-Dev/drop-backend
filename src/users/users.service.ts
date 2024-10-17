import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
//import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
  @InjectModel(User.name) private userModel: Model<UserDocument>,
  //private jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
	
	const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    //const createdUser = new this.userModel(createUserDto);
	const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
	
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ usertype: 'photographer' }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
	/*  
	if (updateUserDto.password) {
    
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }
	
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;*/
	
	const { password, ...otherFields } = updateUserDto;
	if (password) {
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		return this.userModel.findByIdAndUpdate(id, { ...otherFields, password: hashedPassword }, { new: true });
	}
	return this.userModel.findByIdAndUpdate(id, otherFields, { new: true });
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
  
  async login(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userModel.findOne({ email: loginUserDto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {'login':'success'};
  }
  
  async getUser(email: string) {
    //const username = userName.toLowerCase();
    const user = await this.userModel.findOne({ email: email });
    return user;
  }
  
	async findByEmail(email: string): Promise<UserDocument | undefined> {
	  return this.userModel.findOne({ email }).exec();
	}

	async findById(id: string): Promise<UserDocument | undefined> {
	  return this.userModel.findById(id).exec();
	}
}
