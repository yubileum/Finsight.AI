# Automatic Reconciliation Retry Feature

## Overview
The system now automatically retries analysis when reconciliation doesn't match, eliminating the need for users to manually re-upload statements.

## How It Works

### **Before (Manual Retry)**
1. User uploads statement
2. Analysis runs
3. If totals don't match → Error shown
4. User has to click "Upload" again
5. Repeat until it works

### **After (Automatic Retry)**
1. User uploads statement
2. Analysis runs (Attempt 1)
3. If totals don't match → **Automatically retries** with enhanced prompt
4. Attempt 2 with more detailed instructions
5. If still doesn't match → Attempt 3
6. After 3 attempts, shows data with warning (if needed)

## Technical Implementation

### **App.tsx Changes**
- Added retry loop (max 3 attempts)
- Progress indicator shows: "Re-analyzing for accuracy (Attempt 2/3)..."
- Brief 500ms pause between attempts
- No error thrown - data shown even if final attempt doesn't perfectly match

### **geminiService.ts Changes**
- `analyzeStatementParts()` now accepts `attempt` parameter
- Enhanced prompt on retries with specific instructions:
  - Double-check every transaction
  - Verify small transactions weren't missed
  - Ensure decimal points are correct
  - Verify reportedTotal matches grand total exactly
  - Count transactions carefully

## Benefits

✅ **Better User Experience**
- No need to manually retry
- Automatic improvement on each attempt
- Clear progress indication

✅ **Higher Success Rate**
- Enhanced prompts on retries
- AI gets specific feedback about what went wrong
- Multiple chances to get it right

✅ **Transparent Process**
- User sees "Re-analyzing for accuracy" message
- Knows the system is working to improve results
- No frustrating error messages

## Example Flow

```
Upload Statement
  ↓
Attempt 1: "Analyzing Transactions..."
  ↓
Totals don't match (calculated: 1234.56, reported: 1234.67)
  ↓
Attempt 2: "Re-analyzing for accuracy (Attempt 2/3)..."
  ↓
Enhanced prompt: "⚠️ RETRY ATTEMPT 2: Previous extraction did not match totals..."
  ↓
Success! Totals match ✓
  ↓
Show results
```

## Configuration

- **Max Attempts**: 3
- **Retry Delay**: 500ms between attempts
- **Tolerance**: 0.005 (half-cent for floating point precision)

## Future Enhancements

Potential improvements:
- Adaptive retry strategy based on error type
- Learning from successful patterns
- User option to configure max attempts
- Detailed reconciliation report showing what changed between attempts
