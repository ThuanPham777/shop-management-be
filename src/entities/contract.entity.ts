import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FreelancerProfile } from './freelancer-profile.entity.js';
import { Shop } from './shop.entity.js';
import { WorkRequest } from './work-request.entity.js';
import { User } from './user.entity.js';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  freelancer_id: string;

  @Column({ type: 'bigint' })
  shop_id: string;

  @Column({ type: 'bigint' })
  work_request_id: string;

  @Column({ type: 'varchar', length: 15, default: 'active' })
  status: 'active' | 'terminated';

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at: Date | null;

  @Column({ type: 'bigint', nullable: true })
  terminated_by: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => FreelancerProfile, (freelancer) => freelancer.contracts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'freelancer_id' })
  freelancer: FreelancerProfile;

  @ManyToOne(() => Shop, (shop) => shop.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToOne(() => WorkRequest, (workRequest) => workRequest.contract, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'work_request_id' })
  work_request: WorkRequest;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'terminated_by' })
  terminator: User;
}
