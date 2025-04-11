# auto-readme

[![Status](https://img.shields.io/badge/status-planning-yellow.svg)](https://#)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://#)  Automatically generate and update project READMEs from your Git history. Focus on coding, let `auto-readme` handle the documentation grind.

## 🎯 Vision and Problem Statement

Modern developers often follow a code-first workflow. They create a repository, start building features, and push commits daily—but often neglect proper documentation until the very end. This leads to incomplete, outdated, or poorly structured README files that fail to reflect the true progress and structure of a project.

`auto-readme` aims to solve this by providing a simple, elegant, developer-first tool that automatically generates and updates a meaningful `README.md` based on the actual work being done in the repository.

## ✨ Core Philosophy

* **Code First:** Let developers focus on coding, not manual documentation.
* **Effortless Docs:** Make documentation a natural by-product of progress.
* **Non-Intrusive:** Be minimal and easy to integrate into any workflow.
* **Reflect Reality:** Documentation should mirror real project evolution via Git.
* **Lean & Agnostic:** Keep the tool fast, local, and language-agnostic.

## 🧑‍💻 Target Audience

* Solo developers
* Hackathon participants
* Students building portfolios
* Open-source maintainers
* Fast-paced engineering teams

## 🚀 Roadmap

### Version 1.0 - MVP (CLI Tool)
* **Purpose:** Generate a basic but meaningful README.md with useful content for any codebase.
* **Features:**
    * `auto-readme init`: Creates a `README.md`.
    * Detects project name (from folder or Git).
    * Includes placeholder for project description.
    * Parses and displays folder/file structure.
    * Adds a basic setup instructions template.
    * Includes a progress log section with the last N Git commits.
    * Runs locally via CLI, works offline with the local Git repo.
    * Requires confirmation before overwriting an existing README.
    * Initial implementation in Node.js or Python.

### Version 1.1 - Daily Mode + Custom Sections
* **Features:**
    * `auto-readme daily`: Appends only the current day’s commits to the progress/changelog section.
    * Introduces a `.auto-readmerc` configuration file.
    * Allows setting custom section titles (e.g., "Recent Changes" instead of "Progress Log").
    * Provides options to include/exclude specific sections.
    * Implements smarter overwrite protection to preserve custom user content within the README.
    * Allows re-running commands to update sections without a full reset.

### Version 1.2 - AI Summary Support (Optional Add-on)
* **Features:**
    * Integrates with OpenAI or a local LLM to summarize commit history into a readable changelog.
    * Option to auto-generate a one-liner project summary based on codebase analysis or Git log.
    * Includes fallback to local models for privacy or offline use.

### Version 2.0 - Project Type Detection and Templates
* **Features:**
    * Detects project type (e.g., Node.js, Python, Java, Web3, Spring Boot).
    * Loads relevant README templates based on detected type.
    * Templates include pertinent sections (e.g., `npm install` for Node.js, `mvn clean install` for Java).
    * Automatically generates relevant badges (language, license, last updated).

### Version 2.1 - VS Code Extension
* **Features:**
    * Provides one-click README generation/update within the VS Code interface.
    * Offers a live preview of README changes.
    * Supports custom templates and drag-and-drop section arrangement.
    * Utilizes the core CLI tool as its backend logic.

### Version 3.0 - GitHub Action Support
* **Features:**
    * Enables automatic README generation/update on every push or on a schedule (e.g., weekly) via GitHub Actions.
    * Configuration managed through `.github/auto-readme.yml`.
    * Option to run within Pull Requests to generate a preview summary of proposed changes.

## 🛠️ Tech Stack (Evaluation)

* **Initial CLI:**
    * Node.js (preferred due to synergy with potential VS Code extension) or Python.
    * Git Parsing: `simple-git`, `isomorphic-git`, or native shell commands.
    * Markdown Generation: `markdown-it` or a custom renderer.
* **AI Summary (Optional):**
    * OpenAI API.
    * Local LLM fallback (e.g., `llama.cpp`, Hugging Face models).
* **VS Code Extension:**
    * JavaScript / TypeScript.
    * Reuses logic from the core CLI tool.
* **GitHub Actions:**
    * Node.js based script or potentially a Docker image.

## 🏷️ Naming Considerations

* **CLI Tool:** `auto-readme`
* **VS Code Extension:** `auto-readme-vscode`
* **Future Web/Chrome Extension:** `readme-glance`, `docless`, `gitpeek`

## 🔭 Long-Term Potential & Future Vision

* Develop a suite of tools under the `auto-readme` ecosystem.
* Establish a standard for automated project documentation.
* Integrate seamlessly with platforms like GitHub, GitLab, and Bitbucket.
* Enhance support for team projects, including multi-user commit summaries.
* Visually highlight contributor work within the generated README.
* **Codebase Evolution (Doclite):** The core logic may evolve across different languages over time:
    * **Python:** Ideal for fast prototyping and AI integration.
    * **JavaScript (Node.js):** Suited for developer tooling, extensions, and frontend integration.
    * **Java:** Potentially for enterprise stability and long-term adoption scenarios.

## ✅ Next Steps

1.  Finalize the tech stack choice for the initial CLI (Node.js vs. Python).
2.  Build and test Version 1.0 (MVP CLI) locally on various real-world projects.
3.  Open-source the project on GitHub, including the roadmap.
4.  Start creating developer-focused content (blog posts, tutorials).
5.  Actively collect early user feedback and iterate on the tool.
