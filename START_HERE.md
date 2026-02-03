# 🚀 Quick Start - LOTC Form Project

**Last Session:** February 2, 2026
**Status:** ✅ Shoes of Hope implementation complete, ready for testing
**Next Step:** Run database migration in Supabase

---

## ⚠️ BEFORE YOU START CODING

### 1. Run Database Migration (Required)
```bash
# Open Supabase Dashboard → SQL Editor
# Copy and run: docs/add-shoes-of-hope-fields-migration.sql
```

This adds 9 new columns:
- `has_siblings` (for sibling conditional)
- 8 Shoes of Hope fields (grade, shoe sizes, underwear sizes, comments)

### 2. Review Session Summary
📄 Read `docs/SESSION_2026-02-02.md` for complete details of what was done

### 3. Check Uncommitted Changes
```bash
git status
git diff neonService.js  # Pickup location name simplifications
```

---

## 🎯 Today's Priority Tasks

### Critical Path
1. ✅ **Run Supabase migration** (see above)
2. **Test Shoes of Hope form**
   - Start server: `node server.js`
   - Open: http://localhost:3000/index.html
   - Select "Shoes of Hope" request type
   - Fill grade, shoe gender, sizes, underwear gender, sizes
   - Submit and verify in Supabase
3. **Verify all fields saved** in Supabase submissions table

### Optional
- Review and commit `neonService.js` changes
- Test sibling conditional field (Does child have siblings?)
- Deploy to Vercel if all tests pass

---

## 📚 Key Documentation

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **READ FIRST** - Complete project context for AI |
| `docs/SESSION_2026-02-02.md` | Yesterday's session summary |
| `docs/SUPABASE_FIELD_AUDIT.md` | All 75+ field mappings |
| `README.md` | Project overview and setup |

---

## 🏗️ What Was Built Yesterday

### Shoes of Hope Request Type
- New request type option in dropdown
- 8 conditional fields with gender-based size selections
- Backend validation in both server.js AND api/submit.js
- Supabase field mappings

### Sibling Conditional Field
- "Does child have siblings?" radio field
- Shows/hides sibling names and placement fields
- Clears values when hidden

### All Fields Verified
- Confirmed all 75+ form fields saving to Supabase
- Fixed missing `child_last_name` field
- Created comprehensive audit documentation

---

## ⚡ Quick Commands

```bash
# Start local dev server
node server.js              # Recommended for testing (no auto-restart)
npm run dev                 # With auto-reload (may interrupt Supabase)

# Check git status
git status
git log --oneline -3

# Test API directly
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d @test-payload.json

# View recent submissions
ls -lt submissions/ | head -5
```

---

## 🐛 Known Issues

### Critical Architecture Note
**server.js and api/submit.js must stay synchronized!**
- Both files contain identical validation logic
- Easy to update one and forget the other
- Always update both when changing validation

### Uncommitted Changes
- `neonService.js` - Pickup location simplifications (review before committing)
- `.serena/` and `.vscode/` - Local config (ignore)
- `submissions/*.json` - Test files (ignore)

---

## 🎨 Development Patterns

### Adding Conditional Fields (3 steps)
1. **HTML:** Add field with `class="hidden"` wrapper
2. **JavaScript:** Add event listener to toggle visibility
3. **Backend:** Add to validation in BOTH server.js and api/submit.js

### Testing End-to-End
1. Submit form in browser
2. Check console logs for Neon CRM account IDs
3. Check console logs for Supabase insert success
4. Query Supabase table to verify fields saved

---

## 🚨 Common Gotchas

1. **Nodemon interrupts Supabase** - Use `node server.js` for testing
2. **Missing Supabase fields fail silently** - Always verify in database
3. **Schema cache delay** - New columns may take seconds to be available
4. **Frontend = camelCase, Database = snake_case** - Check mappings in supabaseService.js

---

## 📞 Need Help?

1. Check `CLAUDE.md` for project patterns
2. Review `docs/SESSION_2026-02-02.md` for yesterday's work
3. Search `docs/SUPABASE_FIELD_AUDIT.md` for field mappings
4. Ask Claude with project context loaded

---

**Git Status:** 2 commits pushed to main
**Latest Commit:** `6e3acd6` - docs: add comprehensive project documentation
**Previous Commit:** `6198efd` - feat: add Shoes of Hope request type

**Ready to start? Run the migration first! 👆**
