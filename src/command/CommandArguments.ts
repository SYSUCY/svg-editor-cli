export class CommandArguments {
  public static exact(args: string[], count: number, usage: string): void {
    if (args.length !== count) throw new Error(`invalid arguments. usage: ${usage}`);
  }

  public static range(args: string[], min: number, max: number, usage: string): void {
    if (args.length < min || args.length > max) throw new Error(`invalid arguments. usage: ${usage}`);
  }

  public static number(value: string | undefined): number {
    const parsed = Number(value);
    if (value === undefined || value.trim() === '' || !Number.isFinite(parsed)) {
      throw new Error(`invalid number: ${value ?? ''}`);
    }
    return parsed;
  }

  public static positive(value: string | undefined): number {
    const parsed = this.number(value);
    if (parsed <= 0) throw new Error(`value must be positive: ${value ?? ''}`);
    return parsed;
  }
}
