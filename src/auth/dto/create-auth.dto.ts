import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { Role } from "enum/role.enum";
import { StatutUtilisateur } from "enum/statututilisateur.enum";

export class CreateAuthDto {
    @ApiProperty({ description: "Nom", example: "Rakoto" })
    @IsString()
    nom: string;

    @ApiProperty({ description: "Prenom", example: "Jean" })
    @IsString()
    prenom: string;

    @ApiProperty({ description: "Email",example: "rakoto@gmail.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ description: "Mot De Passe",example: "12345678" })
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial" })
    motDePasse: string;

    @ApiProperty({ description: "confirmation MotDePasse",example: "12345678" })
    @MinLength(8)
    confirmationMotDePasse: string;

    @ApiProperty({ description: "Numéro téléphone",example: "0612345678" })
    @IsString()
    telephone: string;

    @ApiProperty({ description: "Adresse",example: "123 rue de la paix" })
    @IsString()
    adresse: string;

    @ApiProperty({ description: "numéro CIN",example: "123456789012" })
    @IsString()
    @Length(12, 12)
    @Matches(/^\d{5}[12]\d{6}/,{message: "Le numéro CIN doit être composé de 12 chiffres"})
    cin: string;

    @ApiProperty({ description: "Sexe",example: "M ou F" })
    @IsString()
    @IsOptional()
    sexe?: string;


    @ApiProperty({ description: "Date de naissance",example: "2020-01-01" })
    @IsDate()
    @Type(() => Date)
    dateNaissance: Date;

    @ApiProperty({ description: "Photo", format: 'binary',example: "123456789012" })
    photo: string;

    @ApiProperty({ description: "Role",example: "DELEGUE" })
    @IsOptional()
    @IsEnum(Role)
    role: Role;

}
