export default {
  version: 1,

  sources: [
    ".claude/**/*",
    "commands/**/*.md",
    "agents/**/*.md",
    "CLAUDE.md",
    "AGENTS.md",
    "settings.json",
    ".specify/**/*",
  ],

  targets: {
    claude: {
      pipelines: [
        {
          transformer: "identity",
          match: ".claude/**/*",
          output: "{{relativePath}}",
        },
        {
          transformer: "identity",
          match: "commands/**/*.md",
          output: ".claude/commands/{{name}}.md",
        },
        {
          transformer: "identity",
          match: "agents/**/*.md",
          output: ".claude/agents/{{name}}.md",
        },
        {
          transformer: "identity",
          match: "settings.json",
          output: ".claude/settings.json",
        },
        {
          transformer: "identity",
          match: "CLAUDE.md",
          output: "CLAUDE.md",
          class: "core",
        },
        {
          transformer: "identity",
          match: "AGENTS.md",
          output: "AGENTS.md",
          class: "core",
        },
      ],
    },

    copilot: {
      pipelines: [
        {
          transformer: "claude-to-copilot-prompt",
          match: ".claude/commands/**/*.md",
          output: ".github/prompts/{{name}}.prompt.md",
        },
        {
          transformer: "claude-to-copilot-prompt",
          match: "commands/**/*.md",
          output: ".github/prompts/{{name}}.prompt.md",
        },
        {
          transformer: "claude-to-copilot-instructions",
          match: ".claude/agents/**/*.md",
          output: ".github/instructions/{{name}}.instructions.md",
        },
        {
          transformer: "claude-to-copilot-instructions",
          match: "agents/**/*.md",
          output: ".github/instructions/{{name}}.instructions.md",
        },
        {
          transformer: "claude-to-copilot-root-instructions",
          match: "CLAUDE.md",
          output: ".github/copilot-instructions.md",
        },
      ],
    },

    gemini: {
      pipelines: [
        {
          transformer: "claude-to-gemini-command",
          match: ".claude/commands/**/*.md",
          output: ".gemini/commands/{{name}}.toml",
        },
        {
          transformer: "claude-to-gemini-command",
          match: "commands/**/*.md",
          output: ".gemini/commands/{{name}}.toml",
        },
        {
          transformer: "claude-to-gemini-agent",
          match: ".claude/agents/**/*.md",
          output: ".gemini/agents/{{name}}.md",
        },
        {
          transformer: "claude-to-gemini-agent",
          match: "agents/**/*.md",
          output: ".gemini/agents/{{name}}.md",
        },
        {
          transformer: "claude-to-gemini-root",
          match: "CLAUDE.md",
          output: "GEMINI.md",
        },
      ],
    },

    speckit: {
      pipelines: [
        {
          transformer: "identity",
          match: ".specify/**/*",
          output: "{{relativePath}}",
        },
      ],
    },
  },
};
