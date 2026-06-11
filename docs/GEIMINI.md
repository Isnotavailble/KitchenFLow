# Gemini Coding Guidelines - Backend Gitignore & Environment Rules

This document outlines instructions and boundaries for Gemini and other AI coding assistants when working on the **POS + KDS** backend codebase. It highlights the repository layout, build guidelines, and lists of ignored files that must be respected at all times.

> [!CAUTION]
> **CRITICAL RULE: NO UNSANCTIONED WRITES**
> Do NOT write, edit, create, or delete any files, or make any code modifications without explicitly asking the user for permission and obtaining their approval first. You must always explain the proposed change and wait for approval before executing any write operations.

---

## 📂 Backend Project Structure

The backend is a **Spring Boot** application built with **Maven**. 

* **Project Root Directory:** [backend/poskds](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/backend/poskds)
* **Configuration:** [application.properties](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/backend/poskds/src/main/resources/application.properties)
* **Main Entry Point:** [PoskdsApplication.java](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/backend/poskds/src/main/java/com/anyawalker/poskds/PoskdsApplication.java)
* **Database Design Specs:** [db_design.md](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/docs/db_design.md)

---

## 🚫 Gitignore Rules to Respect

All AI agents must respect the rules defined in the backend [git ignore file](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/backend/poskds/.gitignore). Do not edit, track, or include references to the following ignored paths in commits, pull requests, or code generation outputs.

| Category | Ignored Patterns / Paths | Description |
| :--- | :--- | :--- |
| **Build Artifacts** | `target/`<br>`build/`<br>`!**/src/main/**/target/`<br>`!**/src/test/**/target/`<br>`!**/src/main/**/build/`<br>`!**/src/test/**/build/` | Built compiled binaries, Maven target outputs, and Gradle build folders. |
| **Maven Wrapper** | `.mvn/wrapper/maven-wrapper.jar` | Binary executable jar for Maven wrapper. |
| **IDE Metadata (IntelliJ)** | `.idea/`<br>`*.iws`<br>`*.iml`<br>`*.ipr` | Project metadata, indexing configurations, and local settings. |
| **IDE Metadata (Eclipse/STS)** | `.apt_generated`<br>`.classpath`<br>`.factorypath`<br>`.project`<br>`.settings/`<br>`.springBeans`<br>`.sts4-cache` | Eclipse and Spring Tool Suite project descriptors and local build configurations. |
| **IDE Metadata (NetBeans)** | `/nbproject/private/`<br>`/nbbuild/`<br>`/dist/`<br>`/nbdist/`<br>`/.nb-gradle/` | NetBeans workspace and build files. |
| **IDE Metadata (VS Code)** | `.vscode/` | Workspace configurations, tasks, and extension recommendations. |

> [!IMPORTANT]
> **Do NOT Modify/Write Ignored Files:** Avoid creating or updating files within any directories listed above (such as `target/` or `.idea/`).
> **Keep Workspace Clean:** If a command generates IDE files, do not stage them for Git.

---

## 🛠️ Build and Development Rules

When implementing features or fixing bugs in the backend:

1. **Maven Execution:**
   Always use the local Maven Wrapper scripts located in [backend/poskds](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/backend/poskds):
   - Windows (PowerShell/CMD): `.\mvnw` or `mvnw.cmd`
   - Linux/macOS: `./mvnw`
2. **Clean Compilations:**
   If dependency issues or caching issues arise, clean the build directory first:
   ```powershell
   .\mvnw clean install
   ```
3. **Database Changes:**
   Ensure database schema changes align with [db_design.md](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/docs/db_design.md).

---

> [!TIP]
> Before introducing new dependencies to [pom.xml](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/backend/poskds/pom.xml), ensure they do not conflict with existing Spring Boot starters.
