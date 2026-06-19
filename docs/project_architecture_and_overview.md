# 🏥 Spring Boot Project Development & Architecture Guide

Welcome to the development team! This guide details our system architecture, project layout, and standard implementation patterns to help you build cohesive and clean features using our Feature-based Organization. Strictly use this for further development process.

---

## 🏗️ Architecture Overview

Our projects follow a strict Feature-based Organization. Instead of grouping all code by technical layers, we group the logical components of our business concerns, exceptions, and mappers under the central feature structure, while keeping database definitions and data access global.

The application follows a clean, direct request-to-persistence flow:

`Request (Client) ──> Controller (Feature) ──> Service (Business Logic) ──> Repository (Global) ──> Database (PostgreSQL)`

---

## 📂 High-Level Project Structure

The Spring Boot application is divided into the following root-level directories:

| Directory / File          | Purpose                                                                                |
| :------------------------ | :------------------------------------------------------------------------------------- |
| **`AppApplication.java`** | The main Spring Boot entry point, located at the root of the main application package. |
| **`features/`**           | Contains all API routing, business logic, mappers, and exceptions.                     |
| **`models/`**             | Contains all global database entities (JPA `@Entity` classes).                         |
| **`repos/`**              | Contains all global data access interfaces (Spring Data JPA `@Repository` interfaces). |

### Anatomy of the `features/` Directory

Inside the `features/` directory, the code is categorized into core cross-cutting concerns and specific business domains:

- **`features/exceptions/`**: Centralized location for all application exceptions. This includes the `GlobalExceptionHandler.java` (`@ControllerAdvice`), standardized API error responses, and all specific business rule exceptions (e.g., `UserNotFoundException.java`).
- **`features/mapper/`**: Centralized location for manually written mapping classes (e.g., `UserMapper.java`, `OrderMapper.java`) responsible for converting data between global Entities and feature-specific DTOs.
- **`features/[FeatureName]/`**: Every business module has a dedicated folder. It contains:
  - **`[FeatureName]Controller.java`**: Exposes the RESTful endpoints, receives requests, delegates processing to the service, and returns structured responses.
  - **`[FeatureName]Service.java`**: The business service class containing the core feature logic, validations, and operations.
  - **`[FeatureName]DTO.java`**: Request and Response data transfer objects specific to the endpoints of this feature.

---

## 🔄 Component Registration & Dependency Injection

We leverage Spring's native component scanning for dependency injection across our architectural boundaries:

- **Controllers** must be annotated with `@RestController` and `@RequestMapping`.
- **Services** must be annotated with `@Service`.
- **Repositories** must extend Spring Data interfaces and be annotated with `@Repository`.
- **Mappers** should be annotated with `@Component` so they can be injected into services via standard constructor injection.
- **Global Exception Handlers** must be annotated with `@ControllerAdvice`.

---

## 💾 Database & Models

- **Global Entities**: Database tables map to Java classes annotated with `@Entity` under the `models/` directory.
- **Global Repositories**: Data access is completely isolated from the business logic via interfaces located in the `repos/` directory.
- **Infrastructure**: Local development relies on containerized environments connected to the configured database provider.
