import { Entity, Column, BaseEntity, CreateDateColumn, Index, ObjectIdColumn } from "typeorm";

export class OAuth {

    @Index()
    @Column({ type: "varchar", length: 255, default: null })
    userID!: string;

    @Column({ default: "" })
    username!: string;
    
    @Column({ default: "" })
    avatar!: string;

    @Column({ type: "longtext", nullable: true, select: false })
    accessToken?: string;

    @Column({ type: "longtext", nullable: true, select: false })
    refreshToken?: string;

    @CreateDateColumn()
    dateAdded!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    lastVerified!: Date;

}

@Entity()
export class User extends BaseEntity {

    @ObjectIdColumn()
    ID!: number;

    @Column(() => OAuth)
    discord!: OAuth;
    
    @Column(() => OAuth)
    osu!: OAuth;

    @Column({ type: "tinytext" })
    country!: string;

    @CreateDateColumn()
    registered!: Date;
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    lastLogin!: Date;
}