import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { FreelancerProfile } from './freelancer-profile.entity.js';
import { Shop } from './shop.entity.js';
import { Contract } from './contract.entity.js';

@Entity('work_requests')
export class WorkRequest {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  freelancer_id: string;

  @Column({ type: 'bigint' })
  shop_id: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'freelancer_request' | 'owner_proposal';

  @Column({ type: 'varchar', length: 10, default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(
    () => FreelancerProfile,
    (freelancer) => freelancer.work_requests,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'freelancer_id' })
  freelancer: FreelancerProfile;

  @ManyToOne(() => Shop, (shop) => shop.work_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToOne(() => Contract, (contract) => contract.work_request)
  contract: Contract;
}
