import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { Auth } from "../entities/auth.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: any) {
        const { idUtilisateur } = payload;
        const user = await this.authRepository.findOne({ where: { idUtilisateur } });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
