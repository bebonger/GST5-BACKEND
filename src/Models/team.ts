import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn, Unique, Index, ManyToOne } from 'typeorm';
import { OsuUser } from './user';

@Entity({ name: "team_invites" })
export class Invite extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => OsuUser, { nullable: false })
    @JoinColumn({ name: "sender" })
    sender!: OsuUser;
  
    @ManyToOne(() => OsuUser, { nullable: false })
    @JoinColumn({ name: "invitee" })
    invitee!: OsuUser;

    @Column({ length: 255, nullable: true })
    inviteMessage: string | null;
}

@Entity({ name: "teams" })
export class Team extends BaseEntity {
    @PrimaryGeneratedColumn()
    teamID!: number;

    @Column({ nullable: false })
    team_name!: string;

    @Column({ nullable: true })
    team_avatar!: string;
    
    @OneToOne(() => OsuUser)
    @JoinColumn({ name: "player1" })
    player1!: OsuUser;

    @OneToOne(() => OsuUser)
    @JoinColumn({ name: "player2" })
    player2!: OsuUser;
}
