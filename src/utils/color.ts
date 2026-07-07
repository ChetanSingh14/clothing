export const formatColor = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  
  const map: Record<string, string> = {
    "#000000": "black",
    "#111111": "black",
    "#ffffff": "white",
    "#8b5a2b": "brown",
    "#7d5a8c": "purple",
    "#4b2840": "plum",
    "#4a3b32": "dark brown",
    "#ead8c8": "sand",
  };

  let formatted = colorStr;
  // Replace each hex match in the string
  const hexRegex = /#[a-f0-9]{6}\b/gi;
  formatted = formatted.replace(hexRegex, (match) => {
    const key = match.toLowerCase();
    return map[key] || match;
  });

  return formatted;
};
