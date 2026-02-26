# Data Room User Guide

This guide explains how to use the Data Room app from an end-user perspective.

## Demo Recordings

Pre-recorded UX walkthroughs are available in:

- `artifacts/demo-video/demo-full-ux-slow.webm`
- `artifacts/demo-video/demo-full-ux-slowest.webm`
- `artifacts/demo-video/demo-full-ux-ultra-slow.webm` (best for step-by-step review)

## What You Can Do

- Create, rename, and delete Data Rooms
- Create, rename, move, and delete nested folders
- Upload, preview, rename, move, and delete PDF files
- Select multiple items in the content list
- Move selected items with dialog flow or drag and drop
- Delete selected items with impact summary before confirmation
- Sort content by `name`, `type`, or `updated`
- Use the app in English (`en`) and German (`de`)

## Main Layout

- Sidebar (left): Data Room list + actions menu
- Content area (right): breadcrumbs, actions, table/list of current folder content
- Dialogs: create/rename/delete/move confirmation and edit dialogs

## Navigation

### Data Room Selection

Use the Data Room list in the sidebar to switch active Data Room.

### Breadcrumb Navigation

Use breadcrumbs above the table to jump back to parent folders quickly.

## Selection and Bulk Actions

### Item Selection

- Select items from the content list
- Folder checkboxes support indeterminate state when only part of a subtree is selected

### Bulk Move

- Select one or more items
- Choose `Move`
- Pick destination folder
- Confirm move

### Bulk Delete

- Select one or more items
- Choose `Delete selected`
- Review impact summary (file/folder counts)
- Confirm delete

## Drag and Drop Move

- Start dragging a selected file/folder
- Hover valid destination folders in the content list
- Drop to move
- Invalid drops are blocked by validation rules

## File Upload and Preview

- Use `Upload PDFs` to add files to the current folder
- You can select one file or multiple files in a single picker action
- Supported archive uploads: `.zip`, `.tar`, `.tar.gz`, `.tgz`
- For archives, only PDF files inside the archive are imported
- In the file picker:
  - `Ctrl` (Windows/Linux) or `Cmd` (macOS) + click to select individual files
  - `Shift` + click to select a range of files
- Only PDF files and supported archives are accepted
- When uploading multiple files, each file is processed independently:
  - Valid PDFs are uploaded
  - Invalid or duplicate files are skipped with feedback
- You can also drag files from your computer into the content list:
  - Drop on the list background to upload into the current folder
  - Drop on a folder row to upload directly into that folder
- Open a file with `View` to preview

## Name Validation Rules

Data Room, folder, and file names are validated for:

- Empty values
- Reserved names (`.` / `..`)
- Duplicate names (case-insensitive, trim-normalized)

Validation errors are shown in dialogs before submission.

## Language Support

The app supports:

- English (`en`)
- German (`de`)

## Persistence Behavior

- Structure metadata is stored in browser `localStorage`
- PDF file blobs are stored in browser IndexedDB
- Data is local to your browser/profile and is not shared across users/devices

## Known Limits

- No backend sync
- No multi-user collaboration
- Large file behavior depends on browser storage limits
