import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Like, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { count } from 'console';
import { skip } from 'rxjs';
import { ConnexionDto } from './dto/connexion.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MotDePasseOublieDto } from './dto/mot-de-passe-oublier.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }
  async inscription(createAuthDto: CreateAuthDto, photo: Express.Multer.File) {
    try {
      createAuthDto.photo = `uploads/${photo.filename}`;

      if (createAuthDto.motDePasse != createAuthDto.confirmationMotDePasse) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      let user = await this.authRepository.findOne({ where: [{ email: createAuthDto.email }, { cin: createAuthDto.cin }, { telephone: createAuthDto.telephone } ] });
      if (user) {
        throw new Error("L'utilisateur existe déjà");
      }

      if (createAuthDto.cin.charAt(5) != "1" && createAuthDto.cin.charAt(5) != "2") {
        throw new Error("Le cin n'est pas valide");
      } else if (createAuthDto.cin.charAt(5) == "1") {
        createAuthDto.sexe = "M";
      } else if (createAuthDto.cin.charAt(5) == "2") {
        createAuthDto.sexe = "F";
      }

      createAuthDto.motDePasse = await bcrypt.hash(createAuthDto.motDePasse, 10);

      user = this.authRepository.create(createAuthDto);
      const utilisateurSauvegarder = await this.authRepository.save(user);

      return {
        message: "Utilisateur inscrit avec succès",
        data: utilisateurSauvegarder,
        status: 201
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }

  }

  
  async listeDesUtilisateurs(limit: number = 10, page: number = 1,search: string = "") {
    try {
      const utilisateurs = await this.authRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        where: [
          { nom: Like(`%${search}%`) },
          { prenom: Like(`%${search}%`) },
          { cin: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ]
      });
      return {
        message: "Liste des utilisateurs",
        data: utilisateurs,
        page: page,
        total: utilisateurs[1],
        status: 200
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async editerUtilisateur(id: string) {
    try {
      const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
      return {
        message: "Utilisateur editer avec succès",
        data: utilisateur,
        status: 200
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async miseAjourUtilisateur(id: string, updateAuthDto: UpdateAuthDto) {
    try {
      const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });

      if (!utilisateur) {
        throw new Error("L'utilisateur n'existe pas");
      }

      Object.assign(utilisateur, updateAuthDto);
      const utilisateurMiseAJour = await this.authRepository.save(utilisateur);
      return {
        message: "Utilisateur mise à jour avec succès",
        data: utilisateurMiseAJour,
        status: 200
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async supprimerUtilisateur(id: string) {
    try {
      const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });

      if (!utilisateur) {
        throw new Error("L'utilisateur n'existe pas");
      }

      await this.authRepository.remove(utilisateur);

      const utilisateurSupprime = await this.authRepository.findOne({ where: { idUtilisateur: id } });

      if (!utilisateurSupprime) {
        return {
          message: "Utilisateur supprimé avec succès",
          data: utilisateur.prenom,
          status: 200
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async generateToken(utilisateur: Auth){
    const payload = {
      idUtilisateur: utilisateur.idUtilisateur,
      email: utilisateur.email,
      role: utilisateur.role,
      cin: utilisateur.cin,
    }

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    })
    return {
      accessToken:  accessToken,
      refreshToken: refreshToken
    }
  }

  async connexion(connextionDto: ConnexionDto){
    try {
      const utilisateur = await this.authRepository.findOne({ where: { email: connextionDto.email } });
      if (!utilisateur) {
        throw new Error("L'utilisateur n'existe pas");
      }

      const motDePasseCorrespond = await bcrypt.compare(connextionDto.motDePasse, utilisateur.motDePasse);
      if (!motDePasseCorrespond) {
        throw new Error("Le mot de passe est incorrect");
      }

      const token = await this.generateToken(utilisateur);
      utilisateur.accessToken = token.accessToken;
      utilisateur.refreshToken = token.refreshToken;

      const utilisateurConnecte = await this.authRepository.save(utilisateur);

      return {
        message: "Connexion reussie",
        data: utilisateurConnecte,
        status: 200
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deconnexion(id: string){
    try {
      const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
      if (!utilisateur) {
        throw new Error("L'utilisateur n'existe pas");
      }
      utilisateur.accessToken = null;
      utilisateur.refreshToken = null;
      const utilisateurDeconnecte = await this.authRepository.save(utilisateur);
      return {
        message: "Deconnexion reussie",
        data: utilisateurDeconnecte,
        status: 200
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async motDePasseOublie(motDePasseOublieDto: MotDePasseOublieDto){
    try {
      const utilisateur = await this.authRepository.findOne({ where: { email: motDePasseOublieDto.email } });
      if (!utilisateur) {
        throw new Error("L'utilisateur n'existe pas");
      }
      
      const motDePasseCorrespondConfirmation = await bcrypt.compare(motDePasseOublieDto.confirmationMotDePasse, motDePasseOublieDto.motDePasse);
      if (!motDePasseCorrespondConfirmation) {
        throw new Error("Le mot de passe est incorrect");
      }
      
      const token = await this.generateToken(utilisateur);
      utilisateur.accessToken = token.accessToken;
      utilisateur.refreshToken = token.refreshToken;
      const utilisateurConnecte = await this.authRepository.save(utilisateur);
      return {
        message: "Connexion reussie",
        data: utilisateurConnecte,
        status: 200
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async profile(id: string){
    try {
      const utilisateur = await this.authRepository.findOne({ where: { idUtilisateur: id } });
      if (!utilisateur) {
        throw new Error("L'utilisateur n'existe pas");
      }
      return {
        message: "Profile utilisateur",
        data: utilisateur,
        status: 200
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  
}

