import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, BaseEntity, PrimaryColumn, Unique, Index, ManyToOne } from 'typeorm';
import { Team } from './team';
import { GroupID, GroupInfo, MatchStage, ResultInfo } from '../Interfaces/bracket';
import { MatchInfo } from '../Interfaces/bracket';


@Entity({ name: "matches" })
export class Match extends BaseEntity {
    @PrimaryColumn()
    matchID!: string; 

    @Column({ type: "enum", enum: MatchStage, name: "stage" })
    stage!: MatchStage;

    @ManyToOne(() => Team, { nullable: false })
    @JoinColumn({ name: "red_team" })
    redTeam!: Team;

    @ManyToOne(() => Team, { nullable: false })
    @JoinColumn({ name: "blue_team" })
    blueTeam!: Team;

    public getInfo = async function(): Promise<MatchInfo> {

        const matchResult = await MatchResult.findOne({
            where: {
                match: {
                    matchID: this.matchID
                }
            }
        });

        const schedule = await Schedule.findOne({
            where: {
                match: {
                    matchID: this.matchID
                }
            }
        });

        const info: MatchInfo = {
            matchID: this.matchID,
            stage: this.stage,
            redTeam: await this.redTeam.getInfo(),
            blueTeam: await this.blueTeam.getInfo(),
            schedule: (schedule) ? schedule.timing : null,
            result: (matchResult) ? await matchResult.getInfo() : null
        };

        return info;
    };
}


@Entity({ name: "match_results" })
export class MatchResult extends BaseEntity {
    @PrimaryColumn()
    resultID!: number;

    @OneToOne(() => Match, { nullable: false })
    @JoinColumn({ name: "matchID" })
    match!: Match;

    @Column()
    redTeamScore!: string;

    @Column()
    blueTeamScore!: string;

    public getInfo = async function(): Promise<ResultInfo> {
        const info: ResultInfo = {
            redTeam: this.redTeamScore,
            blueTeam: this.blueTeamScore
        };

        return info;
    };
}

@Entity({ name: "schedules" })
export class Schedule extends BaseEntity {

    @PrimaryGeneratedColumn()
    scheduleID!: number;

    @OneToOne(() => Match, { nullable: false })
    @JoinColumn({ name: "matchID" })
    match!: Match;

    @Column({ type: "timestamp" })
    timing!: Date;
}

@Entity({ name: "groups" })
export class Group extends BaseEntity {
    
    @PrimaryColumn({ type: "enum", enum: GroupID })
    groupID!: GroupID;

    @OneToOne(() => Team, { nullable: true })
    @JoinColumn({ name: "seedA" })
    seedA: Team;

    @OneToOne(() => Team, { nullable: true })
    @JoinColumn({ name: "seedB" })
    seedB: Team;

    @OneToOne(() => Team, { nullable: true })
    @JoinColumn({ name: "seedC" })
    seedC: Team;

    @OneToOne(() => Team, { nullable: true })
    @JoinColumn({ name: "seedD" })
    seedD: Team;

    @OneToOne(() => Team, { nullable: true })
    @JoinColumn({ name: "seedE" })
    seedE: Team;

    public getInfo = async function(): Promise<GroupInfo> {
        const info: GroupInfo = {
            groupID: this.groupID,
            seedA: this.seedA,
            seedB: this.seedB,
            seedC: this.seedC,
            seedD: this.seedD,
            seedE: this.seedE,
        };

        return info;
    }
}