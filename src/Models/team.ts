import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn, Unique, Index } from 'typeorm';
import { OsuUser } from './user';

@Entity({ name: "team_invites" })
export class Invite extends BaseEntity {
    @PrimaryColumn({ nullable: false })
    sender!: number; // sender's userID

    @Column({ nullable: false })
    invitee!: number; // invitee's userID

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
