# Getting started: building AfroCuban Metronome with Claude Code

A guide for Vincent. You'll run everything on your Mac Studio. Claude Code does the coding. Your jobs are to decide, approve, test and play.

## Short on time? The fast path

1. Do Part 1, the one-time setup, which takes about 20–30 minutes.
2. Start Part 2 and let Claude finish Phases 0 and 1. That gives you your prototype as a real project with save points.
3. Stop anytime. Next time, open Terminal and run `cd ~/Projects/afrocuban-metronome` and then `claude --continue` to pick up where you left off.

## The big picture

**Now (local only):**
```
Your Mac Studio ──(Claude Code writes code, you approve)──▶ local git repo (save points)
      └─ local preview: http://localhost:8000 on the Mac, or your phone on the same Wi-Fi
```
**Later** (when you're ready): the same repo goes up to GitHub, and GitHub Pages serves it at metronome.rootsofsalsa.com. Your whole history carries over.

This kit contains:

| File | What it's for |
|---|---|
| `CLAUDE.md` | Project memory. Claude Code reads it automatically every session: your pattern names, notation, counting rules and working agreements. |
| `docs/BUILD_BRIEF_v1.md` | The step-by-step build plan: Phases 0–4 done locally, plus a "Later" section for GitHub. Each phase has a "done when" check. |
| `prototype/afrocuban-metronome-v1.0.html` | The approved prototype, used as the reference. You can double-click it to open it in a browser. |
| `samples/README.md` | How to name and record your clave, campana and catá samples. |
| `brand/` | Put your `BRANDBOOK.md` and `logo.svg` here. The design follows them. |

---

## Part 1: One-time setup (about 20–30 minutes)

Open **Terminal** (press Cmd+Space, type "Terminal", press Enter). Paste each command, press Enter, and wait for it to finish.

**1. Apple's developer tools** (this includes git):
```bash
xcode-select --install
```
If it says they're already installed, that's fine.

**2. Homebrew**, the Mac's package installer. You'll use it for audio conversion now, and for the GitHub tool later:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
When it finishes, it prints "Next steps" with two or three commands. Run those too.

**3. ffmpeg** (for converting your recordings later):
```bash
brew install ffmpeg
```

**4. Claude Code:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```
Open a **new** Terminal window and check that it installed:
```bash
claude --version
```
You should see a version number. If you prefer a window over the terminal, the Claude desktop app also runs Claude Code.

**5. Make the project folder and put this kit in it:**
```bash
mkdir -p ~/Projects/afrocuban-metronome
open ~/Projects/afrocuban-metronome
```
A Finder window opens. Unzip the kit and drag its contents (not the outer folder) into it. You should see `CLAUDE.md` directly inside `afrocuban-metronome`.

**6. Add your brand files.** Copy your `BRANDBOOK.md` and logo SVG into the `brand` folder, and name the logo `logo.svg`.

---

## Part 2: Your first session

```bash
cd ~/Projects/afrocuban-metronome
claude
```

1. **Log in.** The first time, a browser window opens. Sign in with your Claude account (the Max plan).
2. **Pick the model.** Type `/model`, press Enter, and choose Opus 5.5.
3. **Switch to plan mode.** Press **Shift+Tab** until the bottom line says plan mode. In plan mode, Claude researches and proposes but doesn't change files, which is the safe way to start any big step.
4. **Paste this first message:**

   > Read CLAUDE.md and docs/BUILD_BRIEF_v1.md, and look at the prototype. Then give me a plain-language plan for Phase 0 and Phase 1. I'm new to Claude Code, so explain each step briefly before you do it. Don't start Phase 2 until I say so.

5. **Read the plan.** If it looks right, approve it. Claude leaves plan mode and starts working.
6. **Handle permission prompts.** Claude asks before running commands or editing files. For each one:
   - **Yes:** allow this one time.
   - **Yes, and don't ask again:** fine for harmless commands like `git status`, `ls`, starting the local preview, or running tests.
   - **No:** anything you don't understand. Ask "what does that command do?"
   - Never blanket-allow `git push`, deleting files, or anything with `sudo`.

---

## Part 3: How to work with Claude Code effectively

### Keys and commands you'll actually use

| Do this | To |
|---|---|
| Type, then press **Enter** | Send a message. For a new line inside a message, type `\` then Enter. |
| **Shift+Tab** | Cycle modes: normal → auto-accept edits → plan mode |
| **Esc** | Stop Claude mid-step, for example if it's heading the wrong way. Then tell it what you want instead. |
| **Esc Esc** | Jump back to an earlier message and try again from there |
| `/model` | Check or switch the model |
| `/clear` | Start fresh. Use it between phases; CLAUDE.md reloads automatically. |
| `/compact` | Shrink a long conversation without losing the thread |
| `/help` | List everything available |
| `@` + filename | Point Claude at a file, e.g. `@site/js/patterns.js` |
| `!` + command | Run a terminal command yourself without leaving Claude, e.g. `! git log --oneline` |
| `claude --continue` | Reopen your last session after closing Terminal |

### Habits that make it go well

1. **One phase per session.** Finish a phase, check it, commit it, then `/clear`.
2. **Plan first for anything big.** Use plan mode (Shift+Tab) and ask "show me the plan before you change anything."
3. **Be specific the way you'd coach a student.** "The campana sounds too long at 120. Shorten its ring" beats "make it sound better."
4. **Test after every change.** Ask "start the local preview", then open http://localhost:8000. To test on your phone, ask Claude to start the Wi-Fi preview and give you the address. Your phone must be on the same Wi-Fi as the Mac. Keeping the screen awake won't work in this local test (it needs a secure online site); that starts working once it's on GitHub Pages.
5. **Commit often.** Ask "commit this with a clear message". Commits are local save points, and "go back to the last commit" undoes a bad turn. Nothing leaves your Mac yet.
6. **Say "explain what you changed"** whenever you want to understand the code. You don't need to read code to direct this project.
7. **You're the authority on the music.** CLAUDE.md tells Claude never to change patterns or counting on its own. If it ever suggests a musical "fix," say no.
8. **Keep long sessions lean.** Your Max plan has generous but finite usage. `/clear` between phases keeps each session sharp and efficient.

### Prompts for each phase

Start each one with `/clear`, then paste:

- **Phase 1b:** "Do Phase 1b: apply my brand from the brand folder. Summarize the brand rules you'll use and any gaps first, then show me screenshots on desktop and phone before I approve."
- **Phase 2:** "Do Phase 2 from the build brief: the tests that protect the patterns and grid. Show me the plan first."
- **Phase 3:** "Do Phase 3: mobile and iPhone reliability. Then start the Wi-Fi preview and tell me exactly how to open it on my iPhone and test with the silent switch on."
- **Phase 4:** "Do Phase 4: the sample-ready audio engine. I'll add my recordings later, so it should fall back to the synthesized sounds for now."
- **Later, going online:** see Part 4.

---

## Part 4: Later, moving to GitHub and going live

When the local version is solid, this takes about an hour.

1. Create a free GitHub organization named `rootsofsalsa`. Click your avatar, choose **Your organizations → New organization → Free**. Then connect your Mac:
   ```bash
   brew install gh
   gh auth login
   ```
   Choose **GitHub.com → HTTPS → Login with a web browser**.
2. In Claude Code, say: *"Do the 'Later: migrate to GitHub' section of the build brief. Push my local repo to the rootsofsalsa organization, set up the Pages workflow, and walk me through the settings and DNS."*

What that will involve:

- **GitHub.** In the repo, go to Settings → Pages. Set **Source** to **GitHub Actions**, and set **Custom domain** to `metronome.rootsofsalsa.com`.
- **Squarespace DNS** (your domain is in Squarespace). Open Domains, choose rootsofsalsa.com, then DNS settings, and add a record:
   - Type: **CNAME**
   - Host: `metronome`
   - Data: `rootsofsalsa.github.io` (use your organization's name if it's different)
- **Wait.** DNS can take anywhere from a few minutes to a few hours. Then go back to GitHub Pages settings and tick **Enforce HTTPS**.
- **Check it.** Open https://metronome.rootsofsalsa.com on your laptop and phone.

After that, every time you approve a push to `main`, the live site updates in a minute or two. Last, link or embed it on rootsofsalsa.com; Claude will give you copy-paste steps.

---

## Part 5: Later tasks, in plain language

- **Adding your recordings:** put the WAV files in a folder named `samples-raw` inside the project, then say: *"Trim, level and convert the recordings in samples-raw following samples/README.md, and wire them in."*
- **Adding a pattern:** *"Add a pattern called ___, 6/8, notation `x . x . . x | . x . x . .`. Write it back to me as step positions before you add it."*
- **Weekly homework (when you're ready):** *"Let's design the weekly homework packs. Propose options, don't build yet."*

## If something goes wrong

- **`claude: command not found`:** open a new Terminal window. If it still fails, run `claude doctor`.
- **No sound on iPhone:** tap Start again, check the volume, and tell Claude what happened. Phase 3 handles the silent switch.
- **Claude seems confused or stuck:** press Esc, then `/clear`, then restate what you want in one or two sentences.
- **Something broke after a change:** say *"undo the last change"* or *"go back to the last commit."*

Official docs: https://code.claude.com/docs
