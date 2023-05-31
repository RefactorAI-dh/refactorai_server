/**
 * Example tokens list: ["My", "name", "is", "Ref", "actor", "AI", "."]
 */
export function formatTokens(tokens: string[]): string {
  let reconstructedSentence = '';
  tokens.forEach((token) => {
    reconstructedSentence += token;
  });
  console.log('tokens: ', tokens);
  return reconstructedSentence;
}
