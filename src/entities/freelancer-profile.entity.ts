import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity.js';
import { WorkRequest } from './work-request.entity.js';
import { Contract } from './contract.entity.js';

@Entity('freelancer_profiles')
export class FreelancerProfile {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', unique: true })
  user_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  house_number: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ward: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  district: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  province: string | null;

  @OneToOne(() => User, (user) => user.freelancer_profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => WorkRequest, (workRequest) => workRequest.freelancer)
  work_requests: WorkRequest[];

  @OneToMany(() => Contract, (contract) => contract.freelancer)
  contracts: Contract[];
}
