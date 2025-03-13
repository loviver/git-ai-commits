import packageJson from "../../package.json";

interface ExtensionConfig {
  name: string;
  displayName: string;
  publisher: string;
  version: string;
  description: string;
  repository: string;
  contributes: any;
  defaultAiModel: string;
}

const config: ExtensionConfig = {
  name: packageJson.name,
  displayName: packageJson.displayName,
  publisher: packageJson.publisher,
  version: packageJson.version,
  description: packageJson.description,
  repository: packageJson.repository?.url || "",
  contributes: packageJson.contributes || {},
  defaultAiModel: packageJson.contributes.configuration.properties['git-ai-commits.aiProvider'].default
};

export default config;