# Hybrid Storage System

Ale Tale uses a **hybrid storage system** that automatically works on all browsers while offering enhanced features for supported browsers.

## Storage Modes

### LocalStorage Mode (Default - All Browsers)
- Works on **all modern browsers** (Chrome, Firefox, Safari, Edge, Opera)
- Data stored in browser's localStorage
- No setup required - works immediately
- Data persists in your browser

### File System Mode (Chrome, Edge, Opera)
- Stores data as **JSON files** on your computer
- Full control and ownership of your data
- Easy backups by copying the folder
- Can be enabled from Settings

## How It Works

### First Launch
Ale Tale automatically uses **localStorage mode** and works immediately. No setup needed!

### Data Files
All your data is stored as human-readable JSON files in your selected directory:

- **`journal_entries.json`** - All your beer tasting notes and entries
- **`bars.json`** - Your saved bars and pubs
- **`settings.json`** - Application settings and metadata

Ale Tale requests read/write permission to your selected directory. This permission is stored by your browser and persists across sessions. You may need to re-grant permission if:
- You clear your browser data
- You switch to a different browser
- The browser updates its security policies

## Switching to File System Mode

If you're using Chrome, Edge, or Opera, you can upgrade to File System mode:

1. Go to **Settings**
2. Find the **Data Directory** section
3. Click **"Switch to File System Storage"**
4. Choose a directory on your computer
5. Your data will be automatically migrated!

## Changing the Directory

You can change your data directory at any time from **Settings → Data Directory → Change Directory**.

 **Important:** When you change directories, your data will NOT be automatically moved. Your old data remains in the previous location. If you want to move your data:

1. Copy the JSON files from your old directory
2. Paste them into your new directory
3. Then change the directory in Settings

## Data Structure

### Journal Entries (`journal_entries.json`)
```json
[
  {
    "id": "uuid",
    "beerName": "string",
    "brewery": "string",
    "style": "string",
    "abv": number,
    "rating": number,
    "notes": "string",
    "location": "string",
    "drankAt": "ISO date",
    "imageUrl": "base64 string (optional)",
    "createdAt": "ISO date"
  }
]
```

### Bars (`bars.json`)
```json
[
  {
    "id": "uuid",
    "name": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "rating": number,
    "notes": "string",
    "visitedAt": "ISO date",
    "createdAt": "ISO date"
  }
]
```

### Settings (`settings.json`)
```json
{
  "version": "string",
  "createdAt": "ISO date"
}
```

## Troubleshooting

### Permission Denied (File System Mode)
If you get a "permission denied" error:
1. Go to Settings
2. Click "Change Directory"
3. Select the same directory again
4. Grant permission when prompted

### Files Not Found
If Ale Tale can't find your files:
1. Make sure you haven't moved or renamed the directory
2. Check that the JSON files exist in the directory
3. Try changing to a different directory and back

### Browser Not Supported
If your browser doesn't support the File System Access API:
- Switch to Chrome, Edge, or Opera
- Or use the localStorage fallback (automatic)

## Security Notes

- Ale Tale never uploads your data anywhere
- All processing happens locally in your browser
- The directory permission is stored by your browser, not by Ale Tale
- Your data files are not encrypted (they're plain JSON)
- If you share your computer, be aware that anyone with access can read the files

## Technical Details

- **API Used:** [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- **Permission Storage:** IndexedDB (browser-managed)
- **File Format:** JSON with UTF-8 encoding
- **Write Strategy:** Atomic writes (create temp file, then replace)
- **Error Handling:** Graceful fallback with user notifications
