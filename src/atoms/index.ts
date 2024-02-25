import { atom } from "jotai";
import { TSecret } from "../types";

export const profileAtom = atom<string | undefined>(undefined);
export const secretsAtom = atom<TSecret[] | undefined>(undefined);
