import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fullname: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  pass_key: string;
}

@Entity()
export class Stream {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  stream_name: string;
  @Column({ default: 'NOT_STARTED' })
  startAt: string;
  @Column({ default: 'NOT_ENDED' })
  endAt: string;
  @Column()
  stream_id: string;
}

@Entity()
export class Viewer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  stream_path: string;
  @Column()
  joined_at: string;
  @Column()
  stream_id: string;
}
