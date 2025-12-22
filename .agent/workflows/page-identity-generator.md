---
description: Workflow to handle the "What is the page about?" part of a missing route.
---

# Page Identity Generator Workflow

When a missing route is detected during the **Full-Stack Integrity Audit**, follow these steps:

## 1. Contextual Scan
- **Read Tech Constitution**: Identify required branding and design tokens.
- **Read Feature Directory**: Understand the data models and services relevant to the new page.

## 2. Generate Logical Page Manifest
Create a markdown block in the chat or as an artifact that defines:
- **Intent**: "The purpose of this page is to [Goal]."
- **Connections**: "Linked from [Source Component] via the [Path]."
- **Function**: "Displays [Data Source] and enables [User Action]."

## 3. Auto-Scaffold Base Component
Create the file at the target path (e.g., `src/features/[feature]/screens/[PageName].tsx`) with:
- **Standard Layout**: Wrap in `AppShell` or relevant layout component.
- **Descriptive Heading**: Use the Oswald font and Oly Gold accent.
- **Empty State**: Include a placeholder or loading state if data is not yet available.

## 4. Legal Loop Check
- **PII Check**: Does this page collect email, phone, or location?
- **Consent Check**: Does it need a "Marketing Use" toggle or Disclosure?
- **Privacy Update**: If yes, trigger a patch to `PrivacyScreen.tsx`.
