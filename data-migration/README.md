# Data Migration Utility

This folder contains utilities for managing and migrating data in the Kanban application.

## Files

- `migrate.js` - Main migration utility with multiple commands

## Usage

```bash
# Show help
node data-migration/migrate.js

# Check for duplicate task IDs (read-only)
node data-migration/migrate.js --diagnose

# Fix duplicate IDs and order fields
node data-migration/migrate.js --fix-duplicates

# Add sample users and tags
node data-migration/migrate.js --populate
```

## Commands

### `--diagnose`
- **Purpose**: Check for duplicate task IDs without making changes
- **Safe**: Read-only operation
- **Output**: Detailed report of duplicates found

### `--fix-duplicates`
- **Purpose**: Fix duplicate task IDs and ensure proper order fields
- **Safe**: No tasks are deleted, only IDs are changed
- **Output**: Detailed log of changes made

### `--populate`
- **Purpose**: Add sample users and tags to the database
- **Safe**: Only adds new data, doesn't modify existing
- **Output**: Confirmation of added data

## Requirements

- Node.js environment
- Firebase configuration in `.env.local`
- Proper Firebase permissions

## Safety Features

- All operations are logged with detailed output
- No data is deleted during migrations
- Duplicate fixes preserve all task data
- Read-only operations are clearly marked
