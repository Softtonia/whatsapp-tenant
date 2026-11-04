export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined;

export type ClassDictionary = Record<string, any>;
export type ClassArray = ClassValue[];

function toVal(mix: ClassValue): string {
  let k;
  let y;
  let str = "";

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix;
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      const len = mix.length;
      for (k = 0; k < len; k++) {
        if (mix[k]) {
          if ((y = toVal(mix[k]))) {
            if (str) str += " ";
            str += y;
          }
        }
      }
    } else if (mix !== null) {
      for (k in mix) {
        if (mix[k]) {
          if (str) str += " ";
          str += k;
        }
      }
    }
  }

  return str;
}

export function cn(...inputs: ClassValue[]): string {
  let i = 0;
  let tmp;
  let str = "";

  while (i < inputs.length) {
    tmp = inputs[i++];
    if (tmp) {
      const val = toVal(tmp);
      if (val) {
        if (str) str += " ";
        str += val;
      }
    }
  }

  return str;
}

export function formatDate(date: string | number | Date): string {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
}
