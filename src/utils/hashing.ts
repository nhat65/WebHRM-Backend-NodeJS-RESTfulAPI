import { hash, compare } from "bcryptjs";

export const doHash = (value: string, saltValue: string | number): Promise<string> => {
    return hash(value, saltValue);
};

export const doHashValidation = (value: string, hashedValue: string): Promise<boolean> => {
    return compare(value, hashedValue);
};
