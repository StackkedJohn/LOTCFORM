# Task Completion Checklist

When completing a development task in the LOTCFORM project, follow this checklist:

## Before Committing Code

### 1. Code Quality
- [ ] Code follows established naming conventions (camelCase for variables, PascalCase for classes)
- [ ] Proper error handling with try-catch blocks
- [ ] Console logging for important operations
- [ ] Comments added for complex logic (sparingly)

### 2. Testing
- [ ] Start development server: `npm run dev`
- [ ] Test form submission manually in browser
- [ ] Verify both local JSON storage and Neon CRM submission (if configured)
- [ ] Check for JavaScript errors in browser console (F12)
- [ ] Test conditional field logic
- [ ] Verify validation for required fields

### 3. File Checks
- [ ] No sensitive data (API keys, credentials) in committed files
- [ ] `.env` file updated if new environment variables added
- [ ] Documentation updated if new features added
- [ ] Submission files not committed (check `.gitignore`)

### 4. Environment Variables
- [ ] Required environment variables documented
- [ ] `.env.example` updated if new variables added
- [ ] Verify `.env` is in `.gitignore`

## Integration Testing

### Local Development
- [ ] Form submits successfully
- [ ] Submissions saved to `submissions/` directory
- [ ] Server logs show successful operations
- [ ] No error messages in console

### Neon CRM Integration (if configured)
- [ ] Caregiver account created/found in Neon
- [ ] Social worker account created/found in Neon
- [ ] Console shows: "Successfully submitted to Neon CRM"
- [ ] Form data properly mapped to Neon fields
- [ ] Fallback to JSON storage works if Neon fails

## Git Workflow

### Before Pushing
- [ ] `git status` - verify only intended files are staged
- [ ] Review changes: `git diff`
- [ ] Ensure `.env` is NOT staged for commit
- [ ] Commit with descriptive message
- [ ] Push to remote: `git push origin main`

### Commit Message Format
```
feat: Add new feature
fix: Fix bug description
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add or update tests
```

## Deployment (Vercel)

### Pre-Deployment Checks
- [ ] Environment variables set in Vercel dashboard
- [ ] `vercel.json` configured correctly
- [ ] API routes in `/api/` directory
- [ ] Static files (HTML) in root directory
- [ ] Test local build works

### Post-Deployment Verification
- [ ] Form loads in production URL
- [ ] Form submission works
- [ ] API endpoints respond correctly
- [ ] Check Vercel logs for errors
- [ ] Verify Neon CRM integration in production

## Project-Specific Considerations

### Form Changes
- [ ] Both HTML and validation updated together
- [ ] Conditional fields handled in both client and server
- [ ] Required fields list updated in `api/submit.js`
- [ ] Field names match between HTML and backend

### Neon CRM Changes
- [ ] `neonService.js` updated if new fields added
- [ ] Data mapping verified in `submitFormToNeon`
- [ ] Error handling maintains graceful degradation
- [ ] Documentation updated in `NEON_INTEGRATION.md`

### Styling Changes
- [ ] Brand colors maintained (from `:root` CSS variables)
- [ ] Poppins font family used
- [ ] Responsive design tested
- [ ] Mobile-friendly layout verified

## No Linting/Formatting Commands
**Note**: This project does not currently have linting or formatting tools configured (no ESLint, Prettier, etc.). Code style is maintained through manual review and consistency with existing code patterns.

## Final Verification
- [ ] All features work as expected
- [ ] No console errors
- [ ] Documentation reflects current state
- [ ] Ready for production deployment
