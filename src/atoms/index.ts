import { atom } from "jotai";
import { TSecret } from "../types";

export const secretsAtom = atom<TSecret[] | undefined>(undefined);
