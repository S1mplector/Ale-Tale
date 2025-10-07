# Robust Storage System - Technical Documentation

## Overview
Ale Tale now implements a **robust, directory-first storage system** that ensures users always have a properly configured data directory before accessing the application.

## Key Principles

### 1. **Mandatory Setup for Supported Browsers**
- On Chrome, Edge, and Opera: Users **must** select a directory before using the app
- The app will not proceed until a directory is selected
- Directory selection is persisted across sessions via IndexedDB

### 2. **Graceful Fallback for Unsupported Browsers**
- On Firefox, Safari, and other browsers: Automatically uses localStorage
- No setup required - works immediately
- Users are notified they're using localStorage mode

### 3. **Persistent State Management**
- Once a directory is selected, the handle is stored in IndexedDB
- Permission persists across browser sessions
- App checks for existing directory on every launch

## Implementation Details

### Storage Adapter States

```typescript
interface InitializationResult {
  initialized: boolean;  // Storage is ready to use
  setupRequired: boolean; // User needs to select directory
}
```

#### State 1: File System Ready ✅
- **Condition:** Chrome/Edge/Opera + directory previously selected
- **Behavior:** App loads normally
- **Storage:** File system (JSON files)

#### State 2: Setup Required ⚙️
- **Condition:** Chrome/Edge/Opera + no directory selected yet
- **Behavior:** Shows setup page, blocks app access
- **Storage:** Not initialized

#### State 3: LocalStorage Mode 💾
- **Condition:** Browser doesn't support File System Access API
- **Behavior:** App loads normally
- **Storage:** Browser localStorage

### Flow Diagram

```
App Launch
    ↓
Initialize Storage Adapter
    ↓
    ├─→ File System API Available?
    │   ├─→ YES: Check for existing directory handle
    │   │   ├─→ Handle Found + Permission OK → ✅ FILE SYSTEM READY
    │   │   └─→ Handle Not Found OR Permission Denied → ⚙️ SETUP REQUIRED
    │   │
    │   └─→ NO: → 💾 LOCALSTORAGE MODE
    ↓
    ├─→ ✅ FILE SYSTEM READY → Load App
    ├─→ ⚙️ SETUP REQUIRED → Show Setup Page (Block App)
    └─→ 💾 LOCALSTORAGE MODE → Load App
```

## Protection Mechanisms

### 1. **Initialization Check**
```typescript
async initialize(): Promise<{ initialized: boolean; setupRequired: boolean }>
```
- Checks if File System API is available
- Attempts to restore previous directory handle from IndexedDB
- Verifies permissions are still valid
- Returns clear state: ready to use or needs setup

### 2. **Operation Blocking**
```typescript
async read<T>(key: string): Promise<T | null> {
  if (!this.initialized) {
    const result = await this.initialize();
    if (result.setupRequired) {
      throw new Error('Storage setup required.');
    }
  }
  // ... proceed with read
}
```
- All read/write operations check initialization
- Throws error if setup required but not completed
- Prevents data corruption or partial writes

### 3. **UI-Level Blocking**
```typescript
// In App.tsx
if (needsSetup) {
  return <SetupPage onComplete={handleSetupComplete} />;
}
```
- Setup page is shown as full-screen takeover
- No navigation possible until setup complete
- Cannot bypass by typing URLs directly

### 4. **State Synchronization**
```typescript
const handleSetupComplete = React.useCallback(() => {
  setNeedsSetup(false);
}, []);
```
- Once setup completes, state updates immediately
- App re-renders and loads main interface
- No page reload needed

## Directory Selection Process

### Initial Setup
1. **User opens app** → Storage adapter initializes
2. **No directory found** → Shows setup page
3. **User clicks "Choose Directory"** → Opens native file picker
4. **User selects folder** → Directory handle stored in IndexedDB
5. **Initialization files created:**
   - `journal_entries.json` (empty array)
   - `bars.json` (empty array)
   - `settings.json` (metadata)
6. **Setup complete** → App loads normally

### Subsequent Launches
1. **User opens app** → Storage adapter initializes
2. **Directory handle found in IndexedDB** → Verify permission
3. **Permission valid** → App loads immediately
4. **Permission denied** → Re-request permission OR show setup page

## Permission Handling

### Permission Verification
```typescript
private async verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    // Check if we already have permission
    if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') {
      return true;
    }
    
    // Request permission if not already granted
    if (await handle.requestPermission({ mode: 'readwrite' }) === 'granted') {
      return true;
    }
  } catch (error) {
    return false;
  }
  
  return false;
}
```

### Permission Scenarios

| Scenario | Behavior |
|----------|----------|
| Permission granted | App loads normally |
| Permission denied | Shows setup page to reselect |
| Permission revoked (browser security) | Shows setup page to reselect |
| Handle invalid (folder moved/deleted) | Shows setup page to reselect |

## Error Recovery

### Scenario 1: Directory Moved or Deleted
**Problem:** User moved or deleted the selected directory

**Detection:**
- File operations fail with "NotFoundError"
- Permission check fails

**Recovery:**
1. Detect invalid handle
2. Clear stored handle from IndexedDB
3. Set `setupRequired = true`
4. Show setup page on next launch
5. User selects new directory

### Scenario 2: Permission Revoked
**Problem:** Browser revoked file system permissions (security policy)

**Detection:**
- `queryPermission()` returns 'denied'
- `requestPermission()` returns 'denied'

**Recovery:**
1. Request permission again automatically
2. If denied, show setup page
3. User can select same or different directory
4. New permission granted

### Scenario 3: Browser Doesn't Support API
**Problem:** User is on Firefox, Safari, or older browser

**Detection:**
- `'showDirectoryPicker' in window` returns false

**Recovery:**
- Automatic fallback to localStorage
- No user intervention needed
- Full functionality maintained

## Settings Page Integration

### Directory Management Section
The Settings page now shows:

1. **Current Storage Status**
   - Directory name (if using file system)
   - "Browser LocalStorage" (if using localStorage)

2. **Action Button (Context-Aware)**
   - **File system mode:** "Change Directory"
   - **LocalStorage mode:** "Switch to File System Storage"
   - **Unsupported browser:** Shows info message

3. **Confirmation Dialogs**
   - Changing directory: Warns data stays in old location
   - Switching to file system: Confirms data migration

4. **Data Migration**
   - Automatic when switching localStorage → file system
   - Copies all data to new JSON files
   - Original localStorage data preserved

## Data Integrity

### Write Operations
- All writes are atomic
- Files created with temp name, then renamed
- No partial writes possible

### Read Operations
- Fallback to empty array if file not found
- JSON parsing errors caught and handled
- Never crashes on corrupt data

### Backup Recommendations
Users are encouraged to:
1. **File system mode:** Copy the directory regularly
2. **LocalStorage mode:** Use export feature from Settings

## Browser Compatibility Matrix

| Browser | Storage Mode | Setup Required | Fallback |
|---------|--------------|----------------|----------|
| Chrome 86+ | File System | Yes (first time) | - |
| Edge 86+ | File System | Yes (first time) | - |
| Opera 72+ | File System | Yes (first time) | - |
| Firefox | LocalStorage | No | Automatic |
| Safari | LocalStorage | No | Automatic |
| Other Modern | LocalStorage | No | Automatic |
| Legacy (No LS) | N/A | N/A | App won't work |

## Security Considerations

### 1. **Permission Model**
- File System Access API uses browser's security model
- Permissions stored by browser, not by app
- User can revoke permissions via browser settings

### 2. **Data Privacy**
- All data stays local (no cloud)
- File system: User's computer
- LocalStorage: Browser's secure storage

### 3. **No Backdoors**
- App cannot access filesystem without permission
- Cannot read/write outside selected directory
- Cannot access other apps' data

## Testing Checklist

### ✅ Chrome/Edge/Opera - First Time User
- [ ] Shows setup page on first launch
- [ ] Cannot access app without selecting directory
- [ ] Directory selection opens native file picker
- [ ] After selection, creates initial JSON files
- [ ] App loads normally after setup
- [ ] Directory persists after browser restart

### ✅ Chrome/Edge/Opera - Returning User
- [ ] App loads immediately (no setup page)
- [ ] Reads data from previously selected directory
- [ ] Can change directory from Settings
- [ ] Can read/write data successfully

### ✅ Chrome/Edge/Opera - Permission Revoked
- [ ] Detects revoked permission
- [ ] Shows setup page to reselect
- [ ] User can reselect same directory
- [ ] Permission re-granted successfully

### ✅ Firefox/Safari - All Scenarios
- [ ] App loads immediately (no setup page)
- [ ] Uses localStorage automatically
- [ ] All features work perfectly
- [ ] Settings shows localStorage mode
- [ ] Friendly message about browser compatibility

### ✅ Mixed Usage
- [ ] LocalStorage data migrates to file system when switching
- [ ] File system data preserved when changing directories
- [ ] Export/Import works in both modes
- [ ] No data loss in any scenario

## Future Enhancements

### Potential Improvements
1. **Auto-backup:** Periodic snapshots to zip file
2. **Conflict resolution:** Handle concurrent edits
3. **Sync across devices:** Optional cloud sync
4. **Directory verification:** Health checks on launch
5. **Storage analytics:** Show disk usage stats

## Troubleshooting Guide

### Issue: "Setup page keeps appearing"
**Cause:** Permission denied or handle invalid
**Fix:** 
1. Clear browser data for the site
2. Reselect directory
3. Grant permission when prompted

### Issue: "Cannot write data"
**Cause:** Permission revoked or disk full
**Fix:**
1. Check disk space
2. Verify directory still exists
3. Reselect directory in Settings

### Issue: "Lost my data"
**Cause:** Directory moved or deleted
**Fix:**
1. Find original directory on computer
2. Change directory in Settings to original location
3. Or import from backup

## Conclusion

This robust storage system ensures:
- ✅ **Data integrity** - No partial writes or corruption
- ✅ **User control** - Explicit directory selection
- ✅ **Browser compatibility** - Works everywhere
- ✅ **Error recovery** - Graceful handling of all edge cases
- ✅ **Security** - Proper permission model
- ✅ **Transparency** - User always knows where data is stored

The system prioritizes **data safety** and **user experience** while maintaining clean, maintainable code architecture.
