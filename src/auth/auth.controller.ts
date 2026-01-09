import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConnexionDto } from './dto/connexion.dto';
import { GetUser } from './decorator/get-user.decorator';
import { Auth } from './entities/auth.entity';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './decorator/role.decorator';
import { Role } from 'enum/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("inscription")
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "création de compte" })
  @ApiBadRequestResponse({ description: "Erreur lors de l'inscription" })
  @UseInterceptors(FileInterceptor('photo'))
  create(@Body() createAuthDto: CreateAuthDto, @UploadedFile() photo: Express.Multer.File) {
    return this.authService.inscription(createAuthDto, photo);
  }

  @Get()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs" })
  @ApiBadRequestResponse({ description: "Erreur de la récupération des listes des utilisateurs" })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {
    return this.authService.listeDesUtilisateurs(limit, page, search);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Profile utilisateur" })
  @ApiBadRequestResponse({ description: "Erreur de la récupération du profile utilisateur" })
  profile(@GetUser() user: any) {
    return this.authService.profile(user.idUtilisateur);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Editer un utilisateur" })
  @ApiBadRequestResponse({ description: "Erreur de lors d'un edite utilisateur" })
  findOne(@Param('id') id: string) {
    return this.authService.editerUtilisateur(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mise à jour d'un utilisateur" })
  @ApiBadRequestResponse({ description: "Erreur de la mise à jour d'un utilisateur" })
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.miseAjourUtilisateur(id, updateAuthDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @ApiBadRequestResponse({ description: "Erreur de la suppression d'un utilisateur" })
  remove(@Param('id') id: string) {
    return this.authService.supprimerUtilisateur(id);
  }

  @Post('connexion')
  @ApiOperation({ summary: "Connexion" })
  @ApiBadRequestResponse({ description: "Erreur de la connexion" })
  connexion(@Body() connexionDto: ConnexionDto) {
    return this.authService.connexion(connexionDto);
  }

  @Post('deconnexion')
  @ApiOperation({ summary: "Deconnexion" })
  @ApiBadRequestResponse({ description: "Erreur de la deconnexion" })
  deconnexion(@Param('id') id: string) {
    return this.authService.deconnexion(id);
  }

}
