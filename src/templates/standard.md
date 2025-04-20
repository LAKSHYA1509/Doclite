# {{project.name}}

{{#if project.purpose}}
{{project.purpose}}
{{else}}
A powerful documentation generator for modern projects.
{{/if}}

---

**Framework:** {{project.framework}}
**Language:** {{project.language}}
**Version:** {{project.version}}
**Type:** {{project.type}}

---

## Overview

{{#if project.description}}
{{project.description}}
{{else}}
Doclite is a smart documentation generator that automatically analyzes your project structure, dependencies, and features to create comprehensive documentation.
{{/if}}

---

## 🚀 Features

{{formatList project.features}}

---

## 🏗️ Project Structure

{{#if project.structure}}
{{formatList project.structure}}
{{else}}
*No structure information available*
{{/if}}

---

## 📈 Code Metrics

- **Total Files:** {{project.metrics.totalFiles}}
- **Source Files:** {{project.metrics.sourceFiles}}
- **Test Files:** {{project.metrics.testFiles}}
- **Total Lines:** {{project.metrics.totalLines}}

---

## 🔒 Build & Dependency Health

- **Build Status:** {{project.buildStatus.ciStatus}}
- **Outdated Dependencies:** {{formatList project.dependencies.outdated}}
- **Vulnerable Dependencies:** {{formatList project.dependencies.vulnerable}}

---

## 🧪 Test Coverage

{{#if project.coverage}}
- **Lines:** {{project.coverage.lines}}%
- **Functions:** {{project.coverage.functions}}%
- **Statements:** {{project.coverage.statements}}%
- **Branches:** {{project.coverage.branches}}%
{{else}}
*No coverage data available*
{{/if}}

---

## 📜 Recent Changes

{{#if gitHistory}}
Last {{commitCount}} commits:
```git
{{formatGitHistory gitHistory}}

{{else}} No Git history available {{/if}}

📦 Installation
```
npm install {{project.name}}
```
📝 Usage
Add usage instructions or CLI examples here.

🙏 Acknowledgements
Generated with Doclite v2 — AI-powered documentation for modern codebases.