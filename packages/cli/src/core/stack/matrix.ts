import type { AgentDomain, TechSkillMapping } from "./types.js";

/**
 * Standard baseline skills guaranteed for each agent domain role
 */
export const DOMAIN_BASE_SKILLS: Record<AgentDomain, string[]> = {
  frontend: ["clean-code", "frontend-design"],
  backend: ["clean-code", "api-patterns"],
  database: ["clean-code", "database-design"],
  test: ["clean-code", "testing-patterns"],
  devops: ["clean-code"],
  security: ["clean-code", "vulnerability-scanner"],
  mobile: ["clean-code", "mobile-design"],
  seo: ["clean-code", "seo-fundamentals"],
  uiux: ["clean-code", "ui-ux-pro-max"],
  game: ["clean-code", "game-development"],
};

/**
 * Default declarative mappings between detected dependencies/files and skills
 */
export const DEFAULT_TECH_SKILL_MATRIX: TechSkillMapping[] = [
  {
    id: "nextjs",
    description: "Next.js application framework",
    matchers: {
      packages: ["next"],
      files: ["next.config.js", "next.config.mjs", "next.config.ts"],
    },
    skills: ["nextjs-best-practices", "react-patterns"],
    targetAgents: ["frontend", "backend"],
  },
  {
    id: "react",
    description: "React library",
    matchers: {
      packages: ["react", "react-dom"],
    },
    skills: ["react-patterns"],
    targetAgents: ["frontend", "uiux"],
  },
  {
    id: "tailwind",
    description: "Tailwind CSS styling engine",
    matchers: {
      packages: ["tailwindcss", "@tailwindcss/postcss"],
      files: ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.mjs"],
    },
    skills: ["tailwind-patterns"],
    targetAgents: ["frontend", "uiux"],
  },
  {
    id: "nestjs",
    description: "NestJS enterprise backend framework",
    matchers: {
      packages: ["@nestjs/core", "@nestjs/common"],
    },
    skills: ["nestjs-expert", "typescript-expert"],
    targetAgents: ["backend"],
  },
  {
    id: "nodejs-backends",
    description: "Node.js server frameworks (Fastify, Express, Hono, Koa)",
    matchers: {
      packages: ["fastify", "express", "hono", "koa"],
    },
    skills: ["nodejs-best-practices"],
    targetAgents: ["backend"],
  },
  {
    id: "drizzle",
    description: "Drizzle ORM for TypeScript",
    matchers: {
      packages: ["drizzle-orm"],
      files: ["drizzle.config.ts", "drizzle.config.js", "drizzle.config.json"],
    },
    skills: ["database-design"],
    targetAgents: ["database", "backend"],
  },
  {
    id: "prisma",
    description: "Prisma ORM for Node/TypeScript",
    matchers: {
      packages: ["@prisma/client", "prisma"],
      files: ["prisma/schema.prisma"],
    },
    skills: ["prisma-expert"],
    targetAgents: ["database", "backend"],
  },
  {
    id: "python",
    description: "Python ecosystem and packages",
    matchers: {
      files: ["pyproject.toml", "requirements.txt", "Pipfile", "poetry.lock"],
    },
    skills: ["python-patterns"],
    targetAgents: ["backend"],
  },
  {
    id: "vitest",
    description: "Vitest unit testing framework",
    matchers: {
      packages: ["vitest"],
      files: ["vitest.config.ts", "vitest.config.js", "vitest.config.mjs"],
    },
    skills: ["tdd-workflow"],
    targetAgents: ["test"],
  },
  {
    id: "jest",
    description: "Jest testing framework",
    matchers: {
      packages: ["jest", "@types/jest"],
      files: ["jest.config.js", "jest.config.ts", "jest.config.json"],
    },
    skills: ["tdd-workflow"],
    targetAgents: ["test"],
  },
  {
    id: "playwright",
    description: "Playwright end-to-end testing",
    matchers: {
      packages: ["@playwright/test", "playwright"],
      files: ["playwright.config.ts", "playwright.config.js"],
    },
    skills: ["webapp-testing"],
    targetAgents: ["test", "frontend"],
  },
  {
    id: "docker",
    description: "Docker containerization and orchestration",
    matchers: {
      files: ["Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yaml"],
    },
    skills: ["docker-expert"],
    targetAgents: ["devops"],
  },
  {
    id: "react-native",
    description: "React Native & Expo mobile ecosystem",
    matchers: {
      packages: ["react-native", "expo"],
      files: ["app.json", "metro.config.js"],
    },
    skills: ["mobile-design", "react-patterns"],
    targetAgents: ["mobile"],
  },
];
