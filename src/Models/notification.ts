import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn, Unique, Index, ManyToOne } from 'typeorm';
import { OsuUser } from './user';

@Entity({ name: "notifications" })
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => OsuUser, { nullable: false })
    @JoinColumn({ name: "user" })
    user!: OsuUser;

    @Column({ nullable: false })
    type!: string;

    @Column("jsonb")
    data: object;

    @Column({ nullable: false, default: true })
    isRead: boolean;
}