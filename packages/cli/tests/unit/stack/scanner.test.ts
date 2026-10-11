import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { scanStackManifest } from "../../../src/core/stack/scanner.js";

describe("StackSniffer Scanner", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "stack-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("scans package.json with dependencies and devDependencies", async () => {
    const pkgJson = {
      name: "test-app",
      dependencies: {
        next: "^15.0.0",
        react: "^19.0.0",
        "drizzle-orm": "^0.35.0",
      },
      devDependencies: {
        vitest: "^2.1.0",
        typescript: "^5.6.0",
      },
    };
    await writeFile(join(tempDir, "package.json"), JSON.stringify(pkgJson, null, 2));

    const manifest = await scanStackManifest(tempDir);
    expect(manifest.runtimes).toContain("node");
    expect(manifest.dependencies["next"]).toBe("^15.0.0");
    expect(manifest.dependencies["drizzle-orm"]).toBe("^0.35.0");
    expect(manifest.devDependencies["vitest"]).toBe("^2.1.0");
  });

  it("detects marker files like drizzle.config.ts and Dockerfile", async () => {
    await writeFile(join(tempDir, "package.json"), "{}");
    await writeFile(join(tempDir, "drizzle.config.ts"), "export default {}");
    await writeFile(join(tempDir, "Dockerfile"), "FROM node:20");

    const manifest = await scanStackManifest(tempDir);
    expect(manifest.markerFiles).toContain("drizzle.config.ts");
    expect(manifest.markerFiles).toContain("Dockerfile");
  });

  it("handles malformed package.json gracefully without throwing", async () => {
    await writeFile(join(tempDir, "package.json"), '{ "invalid json');

    const manifest = await scanStackManifest(tempDir);
    expect(manifest.dependencies).toEqual({});
    expect(manifest.runtimes).toContain("node");
  });

  it("detects nested prisma schema", async () => {
    await writeFile(join(tempDir, "package.json"), "{}");
    await mkdir(join(tempDir, "prisma"), { recursive: true });
    await writeFile(join(tempDir, "prisma", "schema.prisma"), "datasource db {}");

    const manifest = await scanStackManifest(tempDir);
    expect(manifest.markerFiles).toContain("prisma/schema.prisma");
  });
});
