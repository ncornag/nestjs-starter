import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { UserModel } from './userModel';
import { ID } from 'src/appModule.interfaces';
import { IUserService, CreateUserBody, UpdateUserBody } from './userService.interface';
import { IUserRepository, _IUserRepository } from './userRepository.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(_IUserRepository)
    private readonly repository: IUserRepository,
    private readonly logger: PinoLogger
  ) {}

  // CREATE
  async create(data: CreateUserBody): Promise<ID> {
    const result = await this.repository.find({ username: data.username });
    if (result.isOk() && result.value[0])
      throw new BadRequestException('Username already exists');
    const id = nanoid();
    await this.repository.create({ id, ...data, roles: ['role:admin'] });
    return id;
  }

  // FIND
  async findById(id: ID): Promise<UserModel> {
    const result = await this.repository.find({ id });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new NotFoundException('User not found');
    return result.value[0];
  }

  // UPDATE
  async update(id: ID, data: UpdateUserBody): Promise<UserModel> {
    const result = await this.repository.updateOne({ id }, data);
    if (result.isErr()) throw result.error;
    return result.value;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    const result = await this.repository.deleteOne({ id });
    if (result.isErr()) throw result.error;
    return result.value;
  }

  // FIND BY USERNAME
  async findByUsername(username: string): Promise<UserModel | undefined> {
    const result = await this.repository.find({ username });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new NotFoundException('User not found');
    return result.value[0];
  }
}
