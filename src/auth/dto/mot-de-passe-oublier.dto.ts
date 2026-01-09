import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Matches, MinLength } from "class-validator";

export class MotDePasseOublieDto {
    @ApiProperty({ description: "Email de l'utilisateur" })
    @IsEmail()
    email: string;

    @ApiProperty({ description: "Code de verification" })
    codeVerification: string;

    @ApiProperty({ description: "Nouveau mot de passe" })
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractere special"
    })
    motDePasse: string;

    @ApiProperty({ description: "Confirmation du mot de passe" })
    @MinLength(8)
    confirmationMotDePasse: string;
}