interface replaceAtType {
  str: string;
  index: number;
  char: string;
}

export default function replaceAt(str, index, char): replaceAtType {
  const string = str.split('');

  string[index] = char;

  return string.join('');
}