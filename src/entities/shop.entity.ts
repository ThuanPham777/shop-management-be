import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { OwnerProfile } from './owner-profile.entity.js';
import { WorkRequest } from './work-request.entity.js';
import { Contract } from './contract.entity.js';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  owner_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string | null;

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

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => OwnerProfile, (owner) => owner.shops, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: OwnerProfile;

  @OneToMany(() => WorkRequest, (workRequest) => workRequest.shop)
  work_requests: WorkRequest[];

  @OneToMany(() => Contract, (contract) => contract.shop)
  contracts: Contract[];
}
