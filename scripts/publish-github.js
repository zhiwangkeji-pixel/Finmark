#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repo = process.argv[2];
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const rootDir = path.resolve(__dirname, "..");

if (!repo || !/^[^/\s]+\/[^/\s]+$/.test(repo)) {
  console.error("Usage: GH_TOKEN=... node scripts/publish-github.js owner/repo");
  process.exit(1);
}

if (!token) {
  console.error("Missing GH_TOKEN or GITHUB_TOKEN environment variable.");
  process.exit(1);
}

const ignoreParts = new Set([".git", ".agents", ".tools", ".tunnel", "data", "tools", "node_modules"]);
const ignoreNames = new Set([
  ".env",
  "cloudflared.err.log",
  "cloudflared.out.log",
  "server.err.log",
  "server.out.log",
]);

function shouldIgnore(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  if (parts.some((part) => ignoreParts.has(part))) return true;
  const base = parts.at(-1);
  if (ignoreNames.has(base)) return true;
  if (base.endsWith(".log") || base.endsWith(".tmp") || base.endsWith(".pid")) return true;
  return false;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(rootDir, fullPath);
    if (shouldIgnore(relativePath)) continue;
    if (entry.isDirectory()) {
      out.push(...walk(fullPath));
    } else if (entry.isFile()) {
      out.push(relativePath.replace(/\\/g, "/"));
    }
  }
  return out.sort();
}

async function github(pathname, options = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "valuation-diary-publisher",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = body?.message || response.statusText;
    throw new Error(`${options.method || "GET"} ${pathname} failed: ${response.status} ${detail}`);
  }
  return body;
}

async function main() {
  const files = walk(rootDir);
  console.log(`Publishing ${files.length} files to ${repo}`);

  const repoInfo = await github(`/repos/${repo}`);
  const branch = repoInfo.default_branch || "main";
  const ref = await github(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const parentSha = ref.object.sha;
  const parentCommit = await github(`/repos/${repo}/git/commits/${parentSha}`);
  const baseTreeSha = parentCommit.tree.sha;

  const tree = [];
  for (const file of files) {
    const fullPath = path.join(rootDir, file);
    const content = fs.readFileSync(fullPath).toString("base64");
    const blob = await github(`/repos/${repo}/git/blobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, encoding: "base64" }),
    });
    tree.push({
      path: file,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
    console.log(`  + ${file}`);
  }

  const newTree = await github(`/repos/${repo}/git/trees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree,
    }),
  });

  const commit = await github(`/repos/${repo}/git/commits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Deploy Finmark application",
      tree: newTree.sha,
      parents: [parentSha],
    }),
  });

  await github(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sha: commit.sha,
      force: false,
    }),
  });

  console.log(`Done: https://github.com/${repo}/commit/${commit.sha}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
