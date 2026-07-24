# Glama Maintenance Grade Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Webex MCP Server's Glama maintenance grade from F to A, verify the organization-owned listing under GitHub user `kashyap3881`, and leave a repeatable stable-release path.

**Architecture:** Treat Glama's maintenance grade as a set of independently verifiable repository signals: maintainer ownership, issue responsiveness, recent default-branch activity, a stable GitHub release, security status, code scanning, and CI. Implement the repository changes in four reviewable commits, merge them through a CI-gated pull request, publish `v0.2.0`, then claim and manually resync the Glama listing.

**Tech Stack:** Node.js 18.20.0+, npm, Node test runner, GitHub Issues, GitHub Actions, GitHub Releases, Docker Buildx, Glama MCP registry.

## Global Constraints

- Create `glama.json` at the repository root with maintainer username exactly `kashyap3881`.
- Keep the declared Node.js floor at `>=18.20.0`.
- Target stable release version `0.2.0` and Git tag `v0.2.0`.
- Do not commit Webex tokens, GitHub tokens, Glama credentials, or Docker Hub credentials.
- Preserve the current moderate-severity audit exception and its October 31, 2026 expiry unless upstream dependencies change during implementation.
- Keep all existing 118 tests passing and add a regression test for GitHub issue #14.
- Do not change runtime behavior except to omit an absent `parentId` from `list_direct_messages` requests.
- Do not publish the tag, GitHub Release, or merge the pull request until the user approves the corresponding checkpoint.
- Use `superpowers:using-git-worktrees` before implementation so execution is isolated from the current checkout.

---

## Current Glama and Repository Findings

The live Glama score page reports the following maintenance inputs:

| Maintenance input | Current Glama result | Repository finding | Recovery action |
| --- | --- | --- | --- |
| Issue responsiveness | `0 of 2 issues responded to in the last 6 months` | Issues #13 and #14 have no maintainer comments | Respond to both; close #13 and fix/close #14 |
| Commit activity | `0 commits in the last 12 weeks` | `main` has commit `6a21e14` from July 24, 2026 | Merge the recovery PR and force a Glama resync |
| Stable release | `No stable releases found` | Tag `v0.1.0` exists, but GitHub has no published Release object | Publish stable GitHub Release `v0.2.0` |
| Critical vulnerabilities | Passing | No critical alerts reported | Preserve |
| High vulnerabilities | Passing | No high alerts reported | Preserve |
| Code scanning | Passing | No findings reported | Preserve |
| CI | Passing | Latest `main` CI completed successfully | Preserve |

Additional profile findings:

- `glama.json` is missing.
- Glama reports the author as unverified.
- Glama reports no tool usage in the last 30 days; this affects profile completion, not the displayed maintenance checklist.
- Glama documents that organization-owned repositories must place `glama.json` at the repository root and repeat the Claim flow after the file is merged.

## Planned File Structure

- Create `glama.json` — declares the GitHub account authorized to claim the organization-owned Glama listing.
- Modify `tools/webex-public-workspace/webex-messaging/list-direct-messages.js` — prevents an omitted `parentId` from being serialized as the string `undefined`.
- Modify `tests/tool-implementations.test.js` — adds regression coverage for issue #14.
- Modify `package.json` — advances the project version from `0.1.0` to `0.2.0`.
- Modify `package-lock.json` — keeps the lockfile's root package version synchronized at `0.2.0`.
- Modify `scripts/release.sh` — stages both npm version files during future releases.
- Modify `.github/workflows/cd.yml` — creates an idempotent stable GitHub Release after tests and Docker publishing succeed.
- Modify `.github/RELEASE_GUIDE.md` — documents the corrected `v0.2.0` release flow and automatic GitHub Release creation.

---

### Task 1: Add Glama Maintainer Ownership Metadata

**Files:**
- Create: `glama.json`

**Interfaces:**
- Consumes: Glama server schema at `https://glama.ai/mcp/schemas/server.json`.
- Produces: Root-level ownership metadata authorizing GitHub user `kashyap3881` to claim the listing.

- [ ] **Step 1: Create the root metadata file**

Create `glama.json` with exactly:

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": [
    "kashyap3881"
  ]
}
```

- [ ] **Step 2: Verify JSON syntax and exact ownership values**

Run:

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('glama.json', 'utf8'));
if (config.\$schema !== 'https://glama.ai/mcp/schemas/server.json') {
  throw new Error('Unexpected Glama schema URL');
}
if (JSON.stringify(config.maintainers) !== JSON.stringify(['kashyap3881'])) {
  throw new Error('Unexpected Glama maintainers');
}
console.log('glama.json ownership metadata is valid');
"
```

Expected:

```text
glama.json ownership metadata is valid
```

- [ ] **Step 3: Confirm no credentials or unrelated metadata were added**

Run:

```bash
git diff -- glama.json
```

Expected: the diff contains only `$schema` and the single `maintainers` entry shown above.

- [ ] **Step 4: Commit the ownership metadata**

Run:

```bash
git add glama.json
git commit -m "chore: add Glama maintainer metadata"
```

Expected: one commit containing only `glama.json`.

---

### Task 2: Respond to the Spark Listing Issue

**Files:**
- No repository files change in this task.

**Interfaces:**
- Consumes: GitHub issue `Kashyap-AI-ML-Solutions/webex-messaging-mcp-server#13`.
- Produces: A maintainer response and a completed issue, contributing one of the two required recent-issue responses.

- [ ] **Step 1: Reconfirm issue #13 is still open and has no maintainer reply**

Run:

```bash
gh issue view 13 \
  --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
  --json number,title,state,comments,url
```

Expected: issue #13 is open and has no comment from `kashyap3881`.

- [ ] **Step 2: Add an accurate maintainer response**

Run:

```bash
gh issue comment 13 \
  --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
  --body 'Thanks for the listing. The Spark listing and install badges were added to the README in PR #15, so this repository-side request is complete.'
```

Expected: GitHub returns the new issue-comment URL.

- [ ] **Step 3: Close the notification as completed**

Run:

```bash
gh issue close 13 \
  --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
  --reason completed
```

Expected: GitHub reports issue #13 as closed.

- [ ] **Step 4: Verify the maintainer response and closed state**

Run:

```bash
gh issue view 13 \
  --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
  --json state,comments \
  --jq '{state,maintainerComments:[.comments[] | select(.author.login == "kashyap3881") | .body]}'
```

Expected: `state` is `CLOSED` and the maintainer comment is present.

---

### Task 3: Fix and Respond to the Direct Messages Issue

**Files:**
- Modify: `tests/tool-implementations.test.js`
- Modify: `tools/webex-public-workspace/webex-messaging/list-direct-messages.js`

**Interfaces:**
- Consumes: Optional `parentId`, `personId`, and `personEmail` arguments passed to `list_direct_messages`.
- Produces: A Webex `/messages/direct` URL that includes `parentId` only when the caller provides a non-empty value.

- [ ] **Step 1: Acknowledge issue #14 with the confirmed diagnosis**

Run:

```bash
gh issue comment 14 \
  --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
  --body 'Thanks for the clear report. Confirmed: list_direct_messages currently serializes an omitted parentId as parentId=undefined. I am adding a regression test and conditional query-parameter handling; the implementation PR will close this issue when merged.'
```

Expected: GitHub returns the new issue-comment URL.

- [ ] **Step 2: Add the failing regression test**

Inside the existing `describe('list_direct_messages', ...)` block in `tests/tool-implementations.test.js`, add:

```js
it('should omit parentId when it is not provided', async () => {
  let capturedRequest;
  global.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({ items: [] })
    };
  };

  await tool.function({
    personEmail: 'test@example.com'
  });

  const requestUrl = new URL(capturedRequest.url);
  assert.strictEqual(
    requestUrl.searchParams.has('parentId'),
    false,
    'Should not include parentId when it is omitted'
  );
  assert.strictEqual(requestUrl.searchParams.get('personEmail'), 'test@example.com');
});
```

- [ ] **Step 3: Run the focused test and verify the regression is exposed**

Run:

```bash
node --test \
  --test-name-pattern='list_direct_messages' \
  tests/tool-implementations.test.js
```

Expected: the new test fails because `requestUrl.searchParams.has('parentId')` is `true`.

- [ ] **Step 4: Implement the minimal conditional query handling**

In `tools/webex-public-workspace/webex-messaging/list-direct-messages.js`, change the JSDoc declaration to:

```js
 * @param {string} [args.parentId] - The optional parent ID to filter messages.
```

Replace:

```js
url.searchParams.append('parentId', parentId);
```

with:

```js
if (parentId) {
  url.searchParams.append('parentId', parentId);
}
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
node --test \
  --test-name-pattern='list_direct_messages' \
  tests/tool-implementations.test.js
```

Expected: both existing direct-message cases and the new omitted-`parentId` case pass.

- [ ] **Step 6: Run the complete validation suite**

Run:

```bash
npm run validate
```

Expected: syntax validation passes and all 119 tests pass.

- [ ] **Step 7: Commit the bug fix and regression coverage**

Run:

```bash
git add \
  tests/tool-implementations.test.js \
  tools/webex-public-workspace/webex-messaging/list-direct-messages.js
git commit -m "fix: omit absent direct-message parent id"
```

Expected: one commit containing the regression test and minimal implementation.

---

### Task 4: Prepare Version 0.2.0

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Current npm package version `0.1.0`.
- Produces: Synchronized npm metadata for stable release `0.2.0`.

- [ ] **Step 1: Confirm the target version and tag do not already exist**

Run:

```bash
node -p "require('./package.json').version"
git ls-remote --exit-code --tags origin refs/tags/v0.2.0
```

Expected: the package command prints `0.1.0`; the tag lookup exits with status 2 and prints no matching tag.

- [ ] **Step 2: Update both npm version files without creating a tag**

Run:

```bash
npm version 0.2.0 --no-git-tag-version
```

Expected: npm prints `v0.2.0` and modifies `package.json` and `package-lock.json`.

- [ ] **Step 3: Verify both version values**

Run:

```bash
node -e "
const manifest = require('./package.json');
const lockfile = require('./package-lock.json');
if (manifest.version !== '0.2.0') throw new Error('package.json version mismatch');
if (lockfile.version !== '0.2.0') throw new Error('package-lock.json version mismatch');
if (lockfile.packages[''].version !== '0.2.0') throw new Error('lock root version mismatch');
console.log('npm versions are synchronized at 0.2.0');
"
```

Expected:

```text
npm versions are synchronized at 0.2.0
```

- [ ] **Step 4: Verify a clean dependency installation**

Run:

```bash
npm ci
npm ls --all
```

Expected: both commands exit successfully with no invalid or missing dependency tree entries.

- [ ] **Step 5: Commit the synchronized version bump**

Run:

```bash
git add package.json package-lock.json
git commit -m "chore: prepare v0.2.0 release"
```

Expected: one commit updating only the npm version metadata.

---

### Task 5: Make Stable GitHub Releases Repeatable

**Files:**
- Modify: `scripts/release.sh`
- Modify: `.github/workflows/cd.yml`
- Modify: `.github/RELEASE_GUIDE.md`

**Interfaces:**
- Consumes: A pushed semantic-version tag matching `v*` after the release commit is on `main`.
- Produces: A tested multi-platform Docker image followed by an idempotently created, non-draft, non-prerelease GitHub Release.

- [ ] **Step 1: Correct the release script's staged version files**

In `scripts/release.sh`, replace:

```bash
git add package.json
```

with:

```bash
git add package.json package-lock.json
```

- [ ] **Step 2: Add an idempotent GitHub Release job**

Append this job to `.github/workflows/cd.yml` after `build-and-push`:

```yaml
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    needs: build-and-push
    permissions:
      contents: write

    steps:
      - name: Create stable GitHub release
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          if gh release view "$GITHUB_REF_NAME" \
            --repo "$GITHUB_REPOSITORY" >/dev/null 2>&1; then
            echo "GitHub release $GITHUB_REF_NAME already exists"
          else
            gh release create "$GITHUB_REF_NAME" \
              --repo "$GITHUB_REPOSITORY" \
              --title "$GITHUB_REF_NAME" \
              --generate-notes \
              --verify-tag
          fi
```

This job intentionally depends on `build-and-push`, so GitHub does not publish a stable Release when tests or Docker publishing fail.

- [ ] **Step 3: Update the release guide's automation description**

In `.github/RELEASE_GUIDE.md`, update the workflow list to:

```markdown
When a semantic-version tag is pushed, GitHub Actions:

1. Runs linting, tests, and coverage.
2. Builds and publishes the AMD64 and ARM64 Docker image.
3. Creates a non-draft, non-prerelease GitHub Release with generated notes.

The GitHub Release job runs only after Docker publishing succeeds. Rerunning
the workflow is safe because the job checks whether the release already
exists before creating it.
```

Update release examples from the already-used `0.1.0` to the planned release:

```bash
./scripts/release.sh 0.2.0
```

- [ ] **Step 4: Validate the shell script syntax**

Run:

```bash
bash -n scripts/release.sh
```

Expected: no output and exit status 0.

- [ ] **Step 5: Validate the workflow syntax**

Run:

```bash
docker run --rm \
  -v "$PWD:/repo" \
  -w /repo \
  rhysd/actionlint:latest
```

Expected: no actionlint findings and exit status 0.

- [ ] **Step 6: Review the release-specific diff**

Run:

```bash
git diff -- \
  scripts/release.sh \
  .github/workflows/cd.yml \
  .github/RELEASE_GUIDE.md
```

Expected: the diff contains only the lockfile staging fix, the release job, and matching documentation.

- [ ] **Step 7: Commit the release automation**

Run:

```bash
git add \
  scripts/release.sh \
  .github/workflows/cd.yml \
  .github/RELEASE_GUIDE.md
git commit -m "ci: publish stable GitHub releases"
```

Expected: one commit containing only release-process changes.

---

### Task 6: Run the Full Pre-Pull-Request Verification

**Files:**
- Verify all files changed by Tasks 1 through 5.

**Interfaces:**
- Consumes: The complete recovery branch.
- Produces: Evidence that the branch preserves supported Node versions, security gates, tests, and formatting.

- [ ] **Step 1: Reinstall from the lockfile**

Run:

```bash
npm ci
```

Expected: dependency installation succeeds.

- [ ] **Step 2: Run linting and the complete test suite**

Run:

```bash
npm run validate
```

Expected: syntax validation and all 119 tests pass.

- [ ] **Step 3: Run coverage**

Run:

```bash
npm run test:coverage
```

Expected: all 119 tests pass and coverage completes without threshold failure.

- [ ] **Step 4: Verify the Node.js 18 floor**

Run:

```bash
npx --yes --package node@18.20.8 \
  --call 'node --version && node --test tests/*.test.js'
```

Expected: Node prints `v18.20.8` and all 119 tests pass.

- [ ] **Step 5: Run both security gates**

Run:

```bash
npx --yes audit-ci@7.1.0 --config ./audit-ci.jsonc
npm audit --audit-level=high --dry-run
```

Expected: `audit-ci` passes with only the existing scoped allowlist entry, and npm reports no high or critical gate failure.

- [ ] **Step 6: Check dependency-tree integrity and whitespace**

Run:

```bash
npm ls --all
git diff --check origin/main...HEAD
```

Expected: both commands exit successfully.

- [ ] **Step 7: Confirm the exact branch scope**

Run:

```bash
git status --short
git diff --stat origin/main...HEAD
git log --oneline origin/main..HEAD
```

Expected:

- the working tree is clean;
- only the files listed in this plan changed;
- the branch contains the three planned repository commits plus the release-automation commit.

---

### Task 7: Open the Recovery Pull Request and Complete Issue Triage

**Files:**
- No additional repository files change in this task.

**Interfaces:**
- Consumes: The verified branch `fix/glama-maintenance-grade`.
- Produces: A draft pull request targeting `main`, with GitHub issue #14 linked for automatic closure.

- [ ] **Step 1: Push the recovery branch**

Run:

```bash
git push -u origin fix/glama-maintenance-grade
```

Expected: GitHub creates or updates the remote branch successfully.

- [ ] **Step 2: Open a draft pull request through the GitHub connector**

Use:

- Repository: `Kashyap-AI-ML-Solutions/webex-messaging-mcp-server`
- Base: `main`
- Head: `fix/glama-maintenance-grade`
- Title: `Restore Glama maintenance signals and prepare v0.2.0`
- Draft: `true`

Use this exact body:

```markdown
## Summary

- add root Glama maintainer metadata for `kashyap3881`
- fix `list_direct_messages` so an omitted `parentId` is not serialized
- add regression coverage for GitHub issue #14
- prepare package version `0.2.0`
- publish stable GitHub Releases after successful tag builds

## Why

Glama currently reports maintenance grade F because it sees no responses to
two recent issues, no recent commits, and no stable release. The commit signal
is stale, while issue #14 and the missing GitHub Release require repository
work. This PR addresses the repository-side gaps and enables ownership claim
and resync for the organization-owned listing.

## Validation

- `npm run validate`
- `npm run test:coverage`
- Node.js 18.20.8 compatibility suite
- `audit-ci` moderate gate
- npm high-severity audit gate
- `npm ls --all`
- `bash -n scripts/release.sh`
- `actionlint`

Closes #14
```

Expected: GitHub returns the URL of an open draft pull request targeting `main`.

- [ ] **Step 3: Wait for every pull-request check**

Required successful checks:

- Test on Node.js 18
- Test on Node.js 20
- Test on Node.js 22
- Security Audit
- Docker Build Test

Expected: all checks conclude `SUCCESS`.

- [ ] **Step 4: Present the PR for user review**

Provide the PR URL, commit list, test evidence, and the fact that issue #13 has been closed and issue #14 will close on merge.

- [ ] **Step 5: Merge only after explicit user approval**

After approval, merge the PR into `main` using the repository's normal merge method.

Expected: issue #14 closes through the PR's `Closes #14` reference, and `main` receives another commit within Glama's 12-week activity window.

- [ ] **Step 6: Verify both maintenance-relevant issues have maintainer responses**

Run:

```bash
for issue_number in 13 14; do
  gh issue view "$issue_number" \
    --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
    --json number,state,comments \
    --jq '{number,state,maintainerResponseCount:([.comments[] | select(.author.login == "kashyap3881")] | length)}'
done
```

Expected: issues #13 and #14 are closed and each reports `maintainerResponseCount` of at least 1.

---

### Task 8: Publish Stable Release v0.2.0

**Files:**
- No repository file changes; this task creates a tag, runs CD, and publishes a GitHub Release.

**Interfaces:**
- Consumes: Approved and merged `main` at version `0.2.0`.
- Produces: Annotated tag `v0.2.0`, successful CD run, Docker image, and stable GitHub Release `v0.2.0`.

- [ ] **Step 1: Obtain explicit approval to publish**

Present the merged commit SHA and state that pushing `v0.2.0` will publish Docker images and a public GitHub Release.

Expected: the user explicitly approves release publication.

- [ ] **Step 2: Synchronize the release worktree with `main`**

Run:

```bash
git fetch origin main --tags
git checkout main
git pull --ff-only origin main
```

Expected: local `main` matches `origin/main`.

- [ ] **Step 3: Verify the release version and clean state**

Run:

```bash
node -p "require('./package.json').version"
git status --short
git tag --list v0.2.0
```

Expected:

- package version is `0.2.0`;
- the working tree is clean;
- no local `v0.2.0` tag exists.

- [ ] **Step 4: Create and push the annotated tag**

Run:

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

Expected: GitHub accepts tag `v0.2.0` and starts the Continuous Deployment workflow.

- [ ] **Step 5: Watch Continuous Deployment to completion**

Run:

```bash
release_run_id="$(
  gh run list \
    --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
    --workflow 'Continuous Deployment' \
    --branch v0.2.0 \
    --limit 1 \
    --json databaseId \
    --jq '.[0].databaseId'
)"
test -n "$release_run_id"
gh run watch "$release_run_id" \
  --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
  --exit-status
```

Expected:

- tests pass;
- multi-platform Docker publishing passes;
- `Publish GitHub Release` passes;
- the workflow concludes successfully.

- [ ] **Step 6: Verify the GitHub Release is stable**

Run:

```bash
gh release view v0.2.0 \
  --repo Kashyap-AI-ML-Solutions/webex-messaging-mcp-server \
  --json tagName,isDraft,isPrerelease,publishedAt,url \
  --jq '{tagName,isDraft,isPrerelease,publishedAt,url}'
```

Expected:

- `tagName` is `v0.2.0`;
- `isDraft` is `false`;
- `isPrerelease` is `false`;
- `publishedAt` contains a non-null ISO-8601 timestamp;
- `url` is `https://github.com/Kashyap-AI-ML-Solutions/webex-messaging-mcp-server/releases/tag/v0.2.0`.

---

### Task 9: Claim, Resync, and Verify the Glama Listing

**Files:**
- No repository files change in this task.

**Interfaces:**
- Consumes: Merged `glama.json`, recent `main` activity, two maintainer issue responses, stable `v0.2.0`, and green CI/security results.
- Produces: A claimed Glama listing associated with `kashyap3881` and maintenance grade A.

- [ ] **Step 1: Open the Glama score page**

Open:

```text
https://glama.ai/mcp/servers/@Kashyap-AI-ML-Solutions/webex-messaging-mcp-server/score
```

Expected: the Webex MCP Server score page loads.

- [ ] **Step 2: Repeat the Claim flow after `glama.json` is on `main`**

Select **Claim**, authenticate to GitHub as `kashyap3881`, and authorize Glama to verify the repository.

Expected: Glama recognizes `kashyap3881` as a maintainer of the organization-owned repository.

- [ ] **Step 3: Trigger a manual server sync**

From the Glama MCP server admin interface, select **Sync Server**.

Expected: Glama starts a new repository ingestion and score calculation.

- [ ] **Step 4: Verify all seven maintenance inputs**

Expand **Maintenance** on the score page and confirm:

1. Both recent issues have maintainer responses, or Glama reports no unresponded recent issues.
2. At least one commit is detected in the last 12 weeks.
3. The last stable release is `v0.2.0`.
4. No critical vulnerability alerts are present.
5. No high-severity vulnerability alerts are present.
6. No code-scanning findings are present.
7. CI is passing.

Expected: all seven inputs are green and Maintenance displays grade **A**.

- [ ] **Step 5: Verify ownership and profile metadata**

Confirm:

- the listing no longer says `Missing or invalid glama.json`;
- the listing no longer says `Author not verified`;
- `kashyap3881` can access the server's Glama admin interface.

Expected: all ownership warnings are cleared.

- [ ] **Step 6: Handle a stale score without changing repository code**

If the score still shows old commit or release data:

1. Confirm the GitHub commit and `v0.2.0` Release remain public.
2. Trigger **Sync Server** one additional time.
3. Allow Glama's documented daily synchronization window to run.
4. If the same stale values remain after that window, report the listing URL and mismatched fields through Glama support or Discord.

Expected: either the score refreshes to A or Glama receives a precise stale-index report backed by public GitHub evidence.

---

## Optional Profile Completion Follow-up

This follow-up is not required for the displayed maintenance grade:

- Use Glama's **Try in Browser** feature once with a dedicated, least-privilege Webex test credential to clear `No recent usage`.
- Do not use a production Webex token for this profile-completion step.
- Add related servers only when there is a genuinely related MCP project; do not add arbitrary relationships solely for profile completion.

## Final Acceptance Checklist

- [ ] `glama.json` exists at repository root with maintainer `kashyap3881`.
- [ ] GitHub issue #13 has a maintainer reply and is closed.
- [ ] GitHub issue #14 has a maintainer reply, a regression test, a merged fix, and is closed.
- [ ] `main` includes recent activity and all CI checks pass.
- [ ] `package.json` and `package-lock.json` both report version `0.2.0`.
- [ ] Git tag `v0.2.0` exists.
- [ ] GitHub Release `v0.2.0` is published, non-draft, and non-prerelease.
- [ ] Glama recognizes `kashyap3881` as a maintainer.
- [ ] Glama detects recent commits and the stable release.
- [ ] Glama continues to report no critical/high vulnerabilities, no code-scanning findings, and passing CI.
- [ ] Glama maintenance grade is A.

## Sources

- Glama score page: `https://glama.ai/mcp/servers/@Kashyap-AI-ML-Solutions/webex-messaging-mcp-server/score`
- Glama ownership metadata documentation: `https://glama.ai/blog/2025-07-08-what-is-glamajson`
- Glama indexing methodology: `https://glama.ai/mcp/methodology`
- GitHub issue #13: `https://github.com/Kashyap-AI-ML-Solutions/webex-messaging-mcp-server/issues/13`
- GitHub issue #14: `https://github.com/Kashyap-AI-ML-Solutions/webex-messaging-mcp-server/issues/14`
- GitHub releases: `https://github.com/Kashyap-AI-ML-Solutions/webex-messaging-mcp-server/releases`
