import { Role } from "enum/role.enum";
import { StatutUtilisateur } from "enum/statututilisateur.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('utilisateur')
export class Auth {
    @PrimaryGeneratedColumn('uuid')
    idUtilisateur: string;

    @Column()
    nom: string;

    @Column()
    prenom: string;

    @Column()
    email: string;

    @Column()
    motDePasse: string;

    @Column({unique: true})
    telephone: string;

    @Column()
    adresse: string;

    @Column({unique: true})
    cin: string;

    @Column()
    sexe: string;

    @Column({type: 'date'})
    dateNaissance: Date;

    @Column({type: 'varchar'})
    photo: string;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @Column({ type: 'enum', enum: StatutUtilisateur, default: StatutUtilisateur.ACTIF })
    statutUtilisateur: StatutUtilisateur;

    @Column({type: 'text',nullable: true})
    accessToken: string | null;

    @Column({type: 'text',nullable: true})
    refreshToken: string | null;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}
