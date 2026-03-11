import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity.js';
import { Shop } from './shop.entity.js';

@Entity('owner_profiles')
export class OwnerProfile {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', unique: true })
  user_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  unique_code: string;

  @OneToOne(() => User, (user) => user.owner_profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Shop, (shop) => shop.owner)
  shops: Shop[];
}
