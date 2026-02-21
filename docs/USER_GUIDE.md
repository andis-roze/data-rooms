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
- Select multiple items in tree and table views
- Move selected items with dialog flow or drag and drop
- Delete selected items with impact summary before confirmation
- Sort content by `name`, `type`, or `updated`
- Use the app in English (`en`) and German (`de`)

## Main Layout

- Sidebar (left): active Data Room selector + folder tree
- Content area (right): breadcrumbs, actions, table/list of current folder content
- Dialogs: create/rename/delete/move confirmation and edit dialogs

## Navigation

### Data Room Selection

Use the Data Room dropdown in the sidebar to switch active Data Room.

### Folder Tree Navigation

- Click a folder in the tree to open it.
- Expanded/collapsed states are managed automatically and can be toggled manually.

### Breadcrumb Navigation

Use breadcrumbs above the table to jump back to parent folders quickly.

### `..` Parent Navigation Entry

In the content table, `..` means “go up one level.”

- Appears only inside subfolders
- Opens the parent folder
- Hidden at root level
- Not a real folder (cannot be renamed or deleted)

## Selection and Bulk Actions

### Item Selection

- Select items from the tree or table
- Parent folder checkboxes support indeterminate state when only part of a subtree is selected
- Selection is synchronized between tree and table

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
- Hover valid destination folders
- Drop to move
- Invalid drops are blocked by validation rules

## File Upload and Preview

- Use `Upload PDF` to add files to the current folder
- Only PDF files are accepted
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
