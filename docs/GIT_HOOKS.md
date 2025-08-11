# Git Hooks Setup

This document explains the Git hooks configuration using Husky for the NestJS Backend Boilerplate.

## 🎯 **Overview**

The project uses Husky to manage Git hooks that ensure code quality and consistency before commits and pushes.

## 📁 **Hook Configuration**

### **Pre-commit Hook** (`.husky/pre-commit`)

Runs before every commit to ensure code quality:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged (runs ESLint and Prettier only on staged files)
echo "📝 Running lint-staged..."
npx lint-staged

# Run TypeScript type checking
echo "🔧 Running TypeScript type check..."
npx tsc --noEmit

echo "✅ Pre-commit checks passed!"
```

**What it does:**
- ✅ **Lint-staged**: Runs ESLint and Prettier only on staged files (faster)
- ✅ **TypeScript check**: Ensures no type errors in the codebase

### **Pre-push Hook** (`.husky/pre-push`)

Runs before pushing to ensure tests pass:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running pre-push tests..."

# Run unit tests
echo "📊 Running unit tests..."
npm test

# Run e2e tests (optional - uncomment if you want to run them on every push)
# echo "🔗 Running e2e tests..."
# npm run test:e2e

echo "✅ All tests passed! Ready to push."
```

**What it does:**
- ✅ **Unit tests**: Ensures all unit tests pass before pushing
- ✅ **E2E tests**: Optional - can be enabled for comprehensive testing

### **Commit-msg Hook** (`.husky/commit-msg`)

Enforces conventional commit message format:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "📝 Validating commit message..."

# Check if commit message follows conventional commit format
npx --no -- commitlint --edit $1

echo "✅ Commit message is valid!"
```

**What it does:**
- ✅ **Conventional commits**: Enforces standardized commit message format
- ✅ **Message validation**: Ensures commit messages follow the project's conventions

## 🔧 **Configuration Files**

### **Lint-staged Configuration** (`package.json`)

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Benefits:**
- 🚀 **Performance**: Only processes staged files
- 🎯 **Efficiency**: Faster than running on entire codebase
- 🔄 **Auto-fix**: Automatically fixes formatting and linting issues

### **Commitlint Configuration** (`commitlint.config.js`)

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 
      'perf', 'test', 'chore', 'ci', 'build', 'revert'
    ]],
    'type-case': [2, 'always', 'lower'],
    'subject-case': [2, 'always', 'lower'],
    'header-max-length': [2, 'always', 72],
  },
};
```

**Enforced commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

## 📝 **Commit Message Examples**

### **Valid Commit Messages**

```bash
# New feature
git commit -m "feat: add user authentication system"

# Bug fix
git commit -m "fix: resolve login validation issue"

# Documentation
git commit -m "docs: update API documentation"

# Code style
git commit -m "style: format code with prettier"

# Refactoring
git commit -m "refactor: improve error handling in auth service"

# Performance
git commit -m "perf: optimize database queries"

# Tests
git commit -m "test: add unit tests for user service"

# Maintenance
git commit -m "chore: update dependencies"
```

### **Invalid Commit Messages**

```bash
# ❌ No type prefix
git commit -m "add user authentication"

# ❌ Wrong case
git commit -m "FEAT: add user authentication"

# ❌ Too long
git commit -m "feat: add comprehensive user authentication system with multiple providers and advanced security features"

# ❌ Ends with period
git commit -m "feat: add user authentication."
```

## 🚀 **Usage**

### **Normal Development Workflow**

```bash
# 1. Make changes to your code
git add .

# 2. Commit (hooks will run automatically)
git commit -m "feat: add new user endpoint"

# 3. Push (hooks will run automatically)
git push origin main
```

### **Bypassing Hooks (Emergency Only)**

```bash
# Skip pre-commit hook
git commit -m "feat: add new feature" --no-verify

# Skip pre-push hook
git push --no-verify
```

⚠️ **Warning**: Only bypass hooks in emergencies. Regular bypassing defeats the purpose of code quality checks.

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Hook not running**
   ```bash
   # Check if hooks are executable
   ls -la .husky/
   
   # Make hooks executable
   chmod +x .husky/*
   ```

2. **Lint-staged not working**
   ```bash
   # Check if lint-staged is installed
   npm list lint-staged
   
   # Reinstall if needed
   npm install --save-dev lint-staged
   ```

3. **Commitlint errors**
   ```bash
   # Check commit message format
   echo "feat: add new feature" | npx commitlint
   ```

4. **TypeScript errors**
   ```bash
   # Run type check manually
   npx tsc --noEmit
   ```

### **Performance Optimization**

If hooks are running slowly:

1. **Use lint-staged** (already configured)
2. **Exclude unnecessary files** from TypeScript check
3. **Run tests in parallel** if possible
4. **Consider skipping e2e tests** in pre-push for faster feedback

## 📚 **Best Practices**

1. **Write meaningful commit messages**
   - Use descriptive subjects
   - Include scope when relevant
   - Keep under 72 characters

2. **Don't bypass hooks unnecessarily**
   - Hooks ensure code quality
   - They catch issues early
   - They maintain consistency

3. **Keep hooks fast**
   - Use lint-staged for performance
   - Only run necessary checks
   - Consider parallel execution

4. **Update hooks when needed**
   - Add new checks as project grows
   - Remove unnecessary checks
   - Keep configuration up to date

## 🔄 **Customization**

### **Adding New Hooks**

```bash
# Create new hook
npx husky add .husky/pre-rebase "npm run some-check"

# Make executable
chmod +x .husky/pre-rebase
```

### **Modifying Existing Hooks**

Edit the hook files directly in `.husky/` directory:

```bash
# Edit pre-commit hook
nano .husky/pre-commit

# Edit pre-push hook
nano .husky/pre-push
```

### **Disabling Specific Checks**

Comment out lines in hook files:

```bash
# In .husky/pre-commit
# npx tsc --noEmit  # Temporarily disable TypeScript check
```

## 🎉 **Benefits**

1. **Code Quality**: Automatic linting and formatting
2. **Type Safety**: TypeScript errors caught before commit
3. **Test Coverage**: Tests must pass before push
4. **Consistency**: Standardized commit messages
5. **Team Collaboration**: Everyone follows the same standards
6. **CI/CD Ready**: Hooks prepare code for deployment 