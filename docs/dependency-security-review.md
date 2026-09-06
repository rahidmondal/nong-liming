# Dependency update — 6 September 2026

The conflict with `main` was confined to `pnpm-lock.yaml`. The resolution regenerates the lockfile from the combined package requirements, retaining the course and Three.js dependencies while advancing the earlier fast-uri fix.

The registry audit initially reported 49 advisories: 32 high, 13 moderate and 4 low. After the frozen-lockfile installation, `pnpm audit --json` reports zero advisories at every severity, with no muted advisories. This describes the registry's known dependency advisories at verification time, not a guarantee against undiscovered application vulnerabilities.

## Patched dependencies

- React Router DOM/Router: 7.14.1 → 7.18.3.
- fast-uri: 4.1.0 → 4.1.3.
- Babel core: 7.29.0 → 7.29.7; replace the incompatible SystemJS plugin 8 override with the patched Babel 7 plugin, 7.29.7.
- brace-expansion: patched releases in the 1, 2 and 5 lines (1.1.18, 2.1.4 and 5.0.9).
- undici 7.29.0, js-yaml 4.3.2, PostCSS 8.5.23, nanoid 3.3.18, browserslist 4.28.8 and fflate 0.8.3.
- Workbox build/window: 7.4.1, satisfying the PWA plugin's peer requirements.
- Vitest UI and coverage: 4.1.4, matching the installed Vitest runner.

Version-scoped overrides keep vulnerable transitive releases out of the lockfile. The configured release-age safeguard remains enabled: undici 7.29.0 and browserslist 4.28.8 clear the reported advisories without requiring exceptions for newer releases. Remove these overrides when upstream constraints reliably resolve patched versions.

The [fast-uri maintainer advisory](https://github.com/fastify/fast-uri/security/advisories/GHSA-f65p-4m7j-42xc) identifies 4.1.3 as a patched release. React Router advisories have differing applicability; for example, the [framework-mode RCE advisory](https://github.com/remix-run/react-router/security/advisories/GHSA-49rj-9fvp-4h2h) excludes BrowserRouter usage. The dependency is upgraded regardless, and the complete registry audit is clean.

## Verification

- Frozen-lockfile installation succeeds with no peer-dependency warnings.
- 232 tests pass across 28 files; TypeScript, full-project ESLint and production/PWA build pass.
- The build performance guard passes: startup JavaScript is 619,609 bytes, 195,773 bytes with Node gzip, still 54% smaller than the original baseline.
- Production preview loads the new bundle and navigates to lessons; Profile retains previously saved test-origin practice. The PWA update prompt activates the new build.
- CI and deployment use Node 24 and the pnpm version declared in package.json. CI also runs the dependency audit and production/performance checks.

The existing rolldown-vite deprecation and large-bundle warnings remain; neither produces a current audit finding. GitHub default-branch alerts can remain visible until this PR is merged and GitHub rescans `main`.
