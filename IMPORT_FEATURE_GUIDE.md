# 📥 Import Real UIL Problems - Complete Guide

## 🎉 What's New

The UIL Number Sense Trainer now has a **direct JSON import feature**! You can load the real UIL problems you've cleaned in the cleanup tool directly into the trainer.

---

## 🚀 Quick Start (3 Steps)

### **Step 1: Clean Problems**
1. Open `uil-cleanup-tool.html`
2. Clean UIL problems (fix symbols, add answers)
3. Click "💾 Download Progress"
4. Save your JSON file (e.g., `uil-cleaned-problems-2026-02-08.json`)

### **Step 2: Import to Trainer**
1. Open `UIL-Number-Sense-Trainer.html`
2. Scroll to bottom of menu: **"📥 Import Real UIL Problems"**
3. Click **"📂 Load Cleaned Problems"**
4. Select your JSON file (or drag & drop)
5. Success! Problems are imported and saved

### **Step 3: Practice!**
1. After import, a new button appears: **"📋 View Imported (X)"**
2. Click it to see all your imported problems grouped by test
3. Choose:
   - **🎯 Practice All** - Drill mode with all imported problems
   - **⭐ Practice Starred Only** - Just the approximation problems
   - **Practice by Test** - Focus on specific year/test (e.g., 2025 Test A)

---

## ✨ Features

### **Persistent Storage**
- Imported problems save to browser localStorage
- Survives browser restarts
- No need to re-import every time

### **Smart Import**
- Automatically detects problem format
- Skips duplicates
- Validates required fields (question + answer)
- Shows import summary

### **Flexible Practice**
- **Drill Mode**: Infinite practice, instant feedback
- **Filter Options**: 
  - All imported problems
  - Starred only (approximation problems)
  - By specific test (2025 Test A, 2024 State, etc.)
- **Shuffled Order**: Problems randomized for variety

### **Problem Display**
- Shows source: "📋 2025 Test A · Problem #15"
- Marks starred problems: "★ Approximation (±5% accepted)"
- Full answer validation with instant feedback

---

## 📊 Import Modal Features

When you click "📂 Load Cleaned Problems", you get:

### **Drag & Drop Zone**
- Click to select JSON file
- Or drag and drop directly

### **Current Status**
- Shows how many problems already imported
- Example: "✓ Currently loaded: 150 imported problems"

### **Clear Option**
- **🗑️ Clear All Imported Problems** button
- Removes all imported data
- Requires confirmation (safety feature)

---

## 🔄 Workflow Examples

### **Scenario 1: Build Your Library Gradually**
```
Day 1: Clean 50 starred problems → Import (50 total)
Day 2: Clean 100 more → Import (150 total, auto-merges)
Day 3: Clean 2025 tests → Import (250 total)
```
Each import adds to your collection!

### **Scenario 2: Team Collaboration**
```
Coach: Cleans 2019-2021 → Exports JSON → Shares with team
Student A: Imports Coach's JSON (300 problems)
Student A: Cleans 2022-2023 → Imports own (600 total)
Student A: Exports combined → Shares back to Coach
```

### **Scenario 3: Test-Specific Practice**
```
1. Import 5 years of State tests (400 problems)
2. Open "View Imported"
3. Click "Practice These" on "2024 Test S"
4. Drill mode with just those 80 problems
```

---

## 💾 JSON Format

Your JSON file should look like this:

```json
{
  "exported": "2026-02-08T14:17:00.000Z",
  "total": 4209,
  "cleaned": 150,
  "problems": [
    {
      "num": 10,
      "q": "192 ÷ 6272 × 6272 − 629 = ",
      "a": "1234",
      "t": "starred",
      "year": "2025",
      "test": "A",
      "starred": true,
      "source": "NumberSense_StudyPacket_A_25.pdf"
    }
  ]
}
```

**Required Fields:**
- `q` (question text)
- `a` (answer)

**Optional but Useful:**
- `num` (problem number 1-80)
- `year` (2019-2026)
- `test` (A, B, D, R, S)
- `starred` (true/false)
- `t` (topic: pct, lcm, mean, etc.)

---

## 🎯 Best Practices

### **Import Strategy**
1. **Start with starred problems** (616 total across all tests)
   - These are most important (#10, 20, 30, 40, 50, 60, 70, 80)
   - Appear on every test
2. **Then add problems 1-20**
   - Foundation problems
   - Timed Round focus
3. **Finally add 21-80 as needed**

### **File Management**
- Keep your JSON files organized:
  - `starred-complete-150-probs.json`
  - `2025-all-tests-400-probs.json`
  - `master-collection-1500-probs.json`
- Date your exports
- Keep backups in Google Drive/Dropbox

### **Practice Schedule**
- **Week 1-2**: Practice all imported (build familiarity)
- **Week 3-4**: Focus on starred only (master approximations)
- **Week 5+**: Practice by specific test type (simulate competition)

---

## ⚙️ Technical Details

### **Storage**
- **Location**: Browser localStorage
- **Key**: `uilImportedProblems`
- **Size Limit**: ~5-10MB (thousands of problems)
- **Persistence**: Permanent until cleared

### **Duplicate Detection**
- Based on question text (`q` field)
- Case-sensitive comparison
- Prevents same problem appearing twice

### **Answer Validation**
- Uses same system as built-in problems
- Supports fractions, decimals, mixed numbers
- ±5% tolerance for starred problems

---

## 🐛 Troubleshooting

### **"Invalid JSON format" Error**
- Make sure file is from cleanup tool
- Check file isn't corrupted
- Try re-downloading from cleanup tool

### **"No valid problems found" Error**
- Problems must have both `q` and `a` fields
- Check JSON structure matches format above

### **Import Button Doesn't Appear**
- Scroll to bottom of main menu
- Look for "📥 Import Real UIL Problems" section
- Refresh page if needed

### **Problems Not Saving**
- Check browser localStorage is enabled
- Clear browser cache and retry
- Try different browser (Chrome/Firefox/Safari)

### **Want to Start Fresh?**
1. Click "📂 Load Cleaned Problems"
2. Click "🗑️ Clear All Imported Problems"
3. Confirm deletion
4. Import new JSON file

---

## 📈 What's Next?

Once you've imported problems, you can:

1. **Track Progress** - Stats include imported problem practice
2. **Mix with Generated** - Use both real and generated problems
3. **Build Complete Archive** - Goal: All 80 problems × 6 years = 480 problems!
4. **Share with Team** - Export your cleaned collection for others

---

## 🎓 Success Story Example

**Goal**: Master 2025 State Test

**Week 1**: 
- Clean all 2025 State problems (80) → Import
- Practice "2025 Test S" daily
- Track improvement via stats

**Week 2**:
- Add 2024 State (160 total) → Import
- Alternate between years
- Focus on weak topics

**Week 3**:
- Add 2023 State (240 total) → Import
- Practice all starred across 3 years
- Simulate full tests

**Competition Day**: 
- Confidence through familiarity
- Know what types appear where
- Faster recognition = better score

---

## 🤝 Need Help?

The import feature is designed to be simple and foolproof:
1. Export from cleanup tool
2. Import to trainer
3. Practice immediately

Your cleaned problems become a permanent part of your training arsenal!

**Happy practicing!** 🚀
