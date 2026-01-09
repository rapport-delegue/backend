import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Matches, MinLength } from "class-validator";

export class ConnexionDto {
    @ApiProperty({ description: "Email", example: "rakoto@gmail.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ description: "Mot De Passe", example: "********" })
    @MinLength(8)
    motDePasse: string;
}