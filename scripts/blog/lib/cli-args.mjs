export function parseNamedArgs(argv, env = process.env) {
  const args = {};
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    index += 1;
  }
  for (const [key, value] of Object.entries(env)) {
    if (
      !key.startsWith("npm_config_") ||
      value === undefined ||
      value === "false"
    )
      continue;
    const name = key.slice("npm_config_".length).replace(/_/g, "-");
    if (!(name in args)) args[name] = value;
  }
  return { args, positional };
}

export function argumentValue(args, positional, key, position) {
  const named = args[key];
  if (named !== undefined && named !== true && named !== "true") return named;
  return positional[position] ?? null;
}
