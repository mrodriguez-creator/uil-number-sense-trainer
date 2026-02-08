# Contributing to UIL Number Sense Trainer

Thank you for your interest in contributing! This project exists to help students, and every contribution makes it better.

## 🎯 Ways to Contribute

### 1. 🐛 Report Bugs
Found an incorrect answer or unexpected behavior?
1. Check [existing issues](../../issues) first
2. Create a new issue with:
   - Problem question exactly as shown
   - Your answer
   - Expected answer
   - Screenshots if helpful

### 2. ➕ Add UIL Problems
Have access to past UIL tests?
1. Fork the repository
2. Add problems to `js/data/real-problems.js`:
```javascript
{
  q: "23 × 17 =",
  a: 391,
  t: "mul",
  hint: "Use (20+3)(20-3) = 20² - 3² = 400 - 9",
  source: "UIL 2023 Invitational"
}
```
3. Submit a pull request

**Important:** Only add problems you have permission to share. Respect UIL copyright.

### 3. 💡 Suggest Features
Have an idea for improvement?
1. Check [existing feature requests](../../issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Create a new issue with the `enhancement` label
3. Describe:
   - What problem it solves
   - How students would use it
   - Any examples or mockups

### 4. 🔧 Contribute Code
Want to implement a feature?

**First-time contributors:** Look for issues labeled [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

**Process:**
1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly (try all modes, check mobile)
5. Commit: `git commit -m "Add feature: brief description"`
6. Push: `git push origin feature/your-feature-name`
7. Open a Pull Request

**Code Guidelines:**
- Keep it simple — readability over cleverness
- Comment complex algorithms
- Test on mobile browsers
- No external dependencies (keep it vanilla JS)
- Follow existing code style

### 5. 📖 Improve Documentation
- Fix typos in README
- Add clarifying comments to code
- Create tutorial videos
- Write study guides

### 6. 🎨 Design Improvements
- Better mobile layouts
- Clearer visual hierarchy
- Accessibility improvements
- Dark theme refinements

## 🧪 Testing Your Changes

Before submitting:
1. Test in both desktop and mobile browsers
2. Try all practice modes (Drill, Timed, Full Test)
3. Verify fraction input works with slash helper
4. Check console for errors
5. Test with different screen sizes

## 📝 Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How did you test this? Include:
- Browsers tested
- Mobile/desktop
- Specific features affected

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style
- [ ] Tested on mobile
- [ ] No console errors
- [ ] Documentation updated if needed
```

## 🚫 What We Won't Accept

- Features requiring a backend/server
- External dependencies or frameworks
- Copyrighted content without permission
- Changes that harm mobile experience
- Tracking or analytics code

## ❓ Questions?

Not sure if your idea fits? **Open an issue first** to discuss before coding!

---

**Every contribution helps Texas students compete better. Thank you!** 🙏
