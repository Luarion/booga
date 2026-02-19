import type { BunFile } from "bun";

export class User {
  public readonly email: string;
  public readonly phone: string;
  public readonly username: string;

  constructor(
    email: string,
    phone: string,
    username: string,
    public readonly password: string,
    public readonly pfp?: File | BunFile,
    public readonly id?: number,
  ) {
    this.email = email.trim().toLowerCase();
    this.phone = phone.trim();
    this.username = username.trim();
  }
}
