# Changelog

## [Unreleased] - 2025-08-02

### Added
- **Design System v2.0** - Complete modernization of UI components
  - New base components: Input, Checkbox, Radio, ToggleSwitch
  - CSS Modules architecture with SASS design tokens
  - Modern glassmorphism effects and styling
  - Bootstrap Icons integration

### Changed
- **SASS Architecture Migration**
  - Migrated from deprecated `@import` to modern `@use` syntax
  - Centralized design tokens in `src/ui/styles/tokens/`
  - Improved color system with semantic naming conventions
  - Enhanced typography and spacing tokens

- **Authentication UI Improvements**
  - Modernized LoginForm with new Input components
  - Added password toggle functionality with eye icon
  - Improved visual design with glassmorphism effects
  - Better error handling and form validation display

- **Navigation Enhancements**
  - Added "Mi perfil" link to sidebar navigation
  - Made user profile clickable in header navigation
  - Improved user experience for profile access

### Fixed
- Resolved SASS compilation warnings and deprecation notices
- Fixed Switch component visual issues and positioning
- Corrected Select component multiple arrow display
- Fixed RadioGroup horizontal layout positioning
- Improved password toggle icon centering and color

### Technical Improvements
- Implemented proper CSS Modules with scoped styling
- Enhanced build process with automatic SASS compilation
- Better component organization and reusability
- Improved development workflow with hot reload support

---

## Previous Versions
- Design System v1.0 - Initial implementation
- Role System Implementation - Complete authentication and authorization
- Permission Manager - Role and permission management system