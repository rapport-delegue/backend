import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

export class RolesGuard implements CanActivate {
    constructor(private readonly roles: string[]) { }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return false;
        }
        return this.roles.includes(user.role);
    }
}