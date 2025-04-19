// src/templates/standard.md
# {{project.name}}

{{#if project.purpose}}
{{project.purpose}}
{{else}}
A powerful documentation generator for modern projects.
{{/if}}

## Overview

{{#if project.description}}
{{project.description}}
{{else}}
Doclite is a smart documentation generator that automatically analyzes your project structure, dependencies, and features to create comprehensive documentation.
{{/if}}

## Recent Changes
{{#if gitHistory}}
Last {{commitCount}} commits:
```git
{{formatGitHistory gitHistory}}
{{else}}
No Git history available
{{/if}}

...

## Features

{{formatList project.features}}

## Installation

```bash
npm install {{project.name}}