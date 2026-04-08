export declare class PasswordService {
    private readonly rounds;
    hash(value: string): Promise<string>;
    compare(value: string, hash: string): Promise<boolean>;
}
