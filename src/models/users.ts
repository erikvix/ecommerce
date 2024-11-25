import DBService from "../database/database.services";
import db from "../database/database.config";

export class User {
  id: number;
  nome: string;
  email: string;
  senha: string;

  constructor(user: Partial<User>) {
    this.id = user.id || 0;
    this.nome = user.nome || "";
    this.email = user.email || "";
    this.senha = user.senha || "";
  }

  private DBService = new DBService(db);

  /**
   * Método para login
   * @param email Email do usuário
   * @param senha Senha do usuário
   * @returns Instância de User ou erro
   */
  public login(email: string, senha: string): User | string {
    const user = this.DBService.get(
      "SELECT * FROM users WHERE email = ? AND senha = ?",
      [email, senha],
      (err, user) => {
        if (err) {
          console.error(err.message);
          return;
        }
        return user;
      }
    );

    if (user) {
      return new User(user);
    } else {
      return "Email ou senha inválidos.";
    }
  }

  /**
   * Método para criar conta (signup)
   * @param user Dados do novo usuário
   * @returns Instância de User ou erro
   */
  public static signup(user: Partial<User>): User | string {
    const emailExists = this.DBService.some((u) => u.email === user.email);

    if (emailExists) {
      return "Email já cadastrado.";
    }

    const newUser = new User({
      id: this.DBService.length + 1, // ID gerado automaticamente
      ...user,
    });

    this.DBService.push(newUser);
    return newUser;
  }
}
