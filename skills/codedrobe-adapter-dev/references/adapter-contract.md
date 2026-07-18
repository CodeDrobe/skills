# Adapter contract

Use existing adapters as the executable contract. A basic adapter resembles:

```js
const example = {
  id: "example",
  displayName: "Example AI",
  defaultPort: 9337,
  lastVerified: {
    darwin: {
      appVersion: "1.2.3",
      build: "123",
      verifiedAt: "2026-07-16"
    }
  },
  platforms: {
    darwin: {
      bundleId: "com.example.ai",
      appCandidates: ["/Applications/Example.app", "~/Applications/Example.app"],
      executableRelative: "Contents/MacOS/Example",
      processMarkers: ["/Example.app/Contents/MacOS/Example"]
    },
    win32: {
      executableCandidates: ["%LOCALAPPDATA%\\Programs\\Example\\Example.exe"],
      uninstallKeys: ["Example"],
      processNames: ["Example.exe"]
    }
  },
  matchTarget(target) {
    return target?.type === "page" && /* strict real-renderer evidence */;
  },
  verification: {
    rootAny: ["#root"],
    required: [
      { name: "workspace", any: [".stable-workspace"] },
      { name: "composer", any: ["[role='textbox'][contenteditable='true']"] }
    ],
    recommended: [
      { name: "sidebar", any: [".stable-sidebar"] }
    ]
  }
};
```

`uninstallKeys` lets Windows discovery read the installer's registry uninstall entry (`InstallLocation`/`DisplayIcon`), which covers installs on non-default drives that path candidates miss.

## Required qualities

- Keep `id` stable, lowercase, and CLI-safe.
- Allocate a default port that does not collide with built-in adapters; always support explicit overrides.
- Keep target matching strict enough to exclude DevTools, extensions, unrelated localhost pages, and helper windows.
- Include platform paths as candidates rather than assuming one fixed installation.
- Name every requirement for useful failure output.
- Keep `rootAny` and required landmarks valid across home, conversation, settings, and other normal routes.
- Treat `rootAny` as the only truly blocking landmark: it doubles as the boot detector (pages without it are treated as still loading) and the minimum app fingerprint. Put panels the app can hide — sidebars, secondary toolbars, detail panes — in `recommended`, because compatibility is judged per window and a hidden `required` panel blocks theming that window (popped-out chats, collapsed layouts).

## Optional modules

Add `rendererProfiles` only when a theme contract requires controlled DOM markers, compatibility copy, chrome, or legacy cleanup. Profiles must expose deterministic ensure, verify, and cleanup behavior.

Add `hostSettings` only when full appearance requires host configuration outside renderer CSS. Apply settings transactionally, write atomically, back up only managed values, report restart requirements, and roll back on renderer failure.

## Integration work

Update the adapter registry, package exports, public TypeScript declarations, README support table, and tests together. Preserve consumers that import Core through documented exports.
