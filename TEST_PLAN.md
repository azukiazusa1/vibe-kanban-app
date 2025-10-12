# Kanban Board Application - Comprehensive Test Plan

## Application Overview

The Kanban Board Application is a Next.js 15-based task management system built with React 19, TypeScript, and PostgreSQL. The application provides comprehensive project management capabilities through an intuitive kanban-style interface.

### Key Features

- **Board Management**: Create and manage multiple kanban boards with titles and descriptions
- **Column Organization**: Add columns with customizable colors for visual categorization
- **Task Management**: Create detailed tasks with titles, descriptions, priority levels, and due dates
- **Drag & Drop**: Intuitive task movement within and between columns using @dnd-kit
- **Priority System**: Four priority levels (LOW, MEDIUM, HIGH, URGENT) with visual indicators
- **Due Date Tracking**: Calendar-based date selection with overdue task warnings
- **Real-time Updates**: Optimistic UI updates for immediate feedback
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS v4

### Technology Stack

- Frontend: Next.js 15 (App Router), React 19, TypeScript
- Database: PostgreSQL with Prisma ORM
- UI: shadcn/ui components (new-york variant)
- Drag & Drop: @dnd-kit/core and @dnd-kit/sortable
- Date Handling: date-fns with Japanese locale support

---

## Test Environment Setup

### Prerequisites

```bash
# Start PostgreSQL via Docker
docker-compose up -d

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Test Data Assumptions

- All tests assume a fresh database state unless specified
- Each test scenario is independent and can be run in any order
- The application runs on `http://localhost:3000` by default

---

## Test Scenarios

### 1. Board Creation and Management

**Seed:** `tests/seed.spec.ts` (default seed)

#### 1.1 Create New Board with Valid Data

**Objective:** Verify that users can successfully create a new board with complete information

**Steps:**
1. Navigate to `http://localhost:3000`
2. Verify the homepage displays with header "Kanban Board"
3. Verify the page title shows "マイボード" (My Boards)
4. Click the "新規ボード作成" (New Board Creation) button with Plus icon
5. Verify the dialog opens with title "新規ボード作成"
6. Locate the "タイトル *" (Title) input field (id: "title")
7. Type "Project Alpha" in the title field
8. Locate the "説明" (Description) textarea field (id: "description")
9. Type "Main project board for tracking development tasks" in the description field
10. Click the "作成" (Create) button

**Expected Results:**
- Dialog closes automatically after submission
- User is redirected back to the home page
- New board card appears in the grid (md:grid-cols-2 lg:grid-cols-3 layout)
- Board card displays:
  - Title: "Project Alpha"
  - Description: "Main project board for tracking development tasks"
  - Creation date in Japanese format (作成日: YYYY/MM/DD)
- Board card has hover effect (shadow-md on hover)

**Element Identifiers:**
- Board creation button: `Button` with text "新規ボード作成" and Plus icon
- Dialog title input: `#title`
- Dialog description textarea: `#description`
- Submit button: `Button[type="submit"]` with text "作成"
- Cancel button: `Button[type="button"]` with text "キャンセル"

---

#### 1.2 Create Board with Title Only (No Description)

**Objective:** Verify that description field is optional

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click the "新規ボード作成" button
3. Enter "Quick Board" in the title field
4. Leave the description field empty
5. Click the "作成" button

**Expected Results:**
- Board is created successfully
- Board card displays only the title "Quick Board"
- No description text is shown in the card
- Creation date is displayed

**Validation Points:**
- Title is required (has asterisk *)
- Description is optional (no asterisk)
- Form submission succeeds without description

---

#### 1.3 Attempt to Create Board Without Title

**Objective:** Verify required field validation for board title

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click the "新規ボード作成" button
3. Leave the title field empty
4. Enter "Some description" in the description field
5. Attempt to click the "作成" button

**Expected Results:**
- HTML5 validation prevents form submission
- Browser displays required field message
- Dialog remains open
- No board is created

**Validation Points:**
- Title input has `required` attribute
- Browser native validation is triggered

---

#### 1.4 Create Board with Long Title and Description

**Objective:** Test handling of lengthy text input

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click the "新規ボード作成" button
3. Enter a title with 100 characters: "This is a very long board title that contains many characters to test the display and storage capabilities of the application system"
4. Enter a description with 500 characters
5. Click the "作成" button

**Expected Results:**
- Board is created successfully
- Title is truncated with `line-clamp-1` CSS class in the card view
- Description is truncated with `line-clamp-2` CSS class in the card view
- Full text is stored in database
- Hover tooltip may show full text (if implemented)

---

#### 1.5 Create Board with Special Characters

**Objective:** Verify handling of special characters in input fields

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click the "新規ボード作成" button
3. Enter title: "Project <Alpha> & Beta #1 @ 2025"
4. Enter description: "Testing special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
5. Click the "作成" button

**Expected Results:**
- Board is created with all special characters preserved
- No XSS vulnerabilities (characters are properly escaped)
- Board displays correctly on the list page

---

#### 1.6 Cancel Board Creation

**Objective:** Verify cancel functionality and state cleanup

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click the "新規ボード作成" button
3. Enter "Test Board" in the title field
4. Enter "Test description" in the description field
5. Click the "キャンセル" (Cancel) button

**Expected Results:**
- Dialog closes immediately
- No board is created
- User remains on the home page
- Board list remains unchanged

**Alternative Path:**
- Press `Escape` key instead of clicking cancel button
- Same expected results

---

#### 1.7 Create Board During Pending State

**Objective:** Verify submit button is disabled during submission

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click the "新規ボード作成" button
3. Enter "Test Board" in the title field
4. Click the "作成" button
5. Immediately try to click the button again during submission

**Expected Results:**
- Submit button shows "送信中..." (Submitting...) text
- Submit button is disabled (cannot be clicked again)
- Only one board is created
- Dialog closes after successful submission

**Element State:**
- Button uses `useFormStatus` hook for pending state
- Button has `disabled={pending}` attribute

---

#### 1.8 View Empty Board List

**Objective:** Verify empty state message when no boards exist

**Steps:**
1. Navigate to `http://localhost:3000` with empty database
2. Wait for page to load

**Expected Results:**
- Page displays "マイボード" heading
- Subtitle shows "作成したKanbanボードから選択してください"
- Empty state message displays: "ボードがありません"
- Empty state is centered with padding (`text-center py-12`)
- "新規ボード作成" button is visible and functional

---

#### 1.9 View Multiple Boards in Grid Layout

**Objective:** Verify grid layout with multiple boards

**Setup:** Create 6 boards with different titles

**Steps:**
1. Create 6 boards using the board creation dialog
2. Navigate to `http://localhost:3000`
3. Observe the board grid layout

**Expected Results:**
- Boards are displayed in a responsive grid:
  - Mobile: Single column
  - Medium screens (md): 2 columns
  - Large screens (lg): 3 columns
- Boards are ordered by creation date (newest first)
- Each board card is clickable
- Hover effect applies to all cards
- Grid has consistent gap spacing (`gap-4`)

---

### 2. Board Navigation and Details

**Seed:** `tests/seed.spec.ts`

#### 2.1 Navigate to Board Details Page

**Objective:** Verify navigation from board list to board details

**Setup:** Create a board named "Development Board"

**Steps:**
1. Navigate to `http://localhost:3000`
2. Locate the "Development Board" card in the board list
3. Click anywhere on the board card

**Expected Results:**
- Browser navigates to `/boards/{boardId}` URL
- Page displays board title "Development Board" in header
- If description exists, it's displayed below the title
- Back button (ArrowLeft icon) is visible in the header
- Page shows empty column area with "新しいカラムを追加" button
- No 404 or error page is displayed

**Element Identifiers:**
- Board card: `Link[href="/boards/{boardId}"]`
- Header title: `h1.text-2xl` with board title
- Back button: `Button[variant="ghost"]` with ArrowLeft icon
- Description (if exists): `p.text-muted-foreground`

---

#### 2.2 Navigate Back to Home from Board Page

**Objective:** Verify back navigation functionality

**Setup:** Navigate to any board details page

**Steps:**
1. Navigate to a board details page (e.g., `/boards/{boardId}`)
2. Locate the back button in the header (ArrowLeft icon)
3. Click the back button

**Expected Results:**
- Browser navigates back to `http://localhost:3000`
- Board list is displayed
- Previously viewed board is visible in the list
- No data loss or errors occur

**Accessibility:**
- Back button has `aria-label="ホームに戻る"` (Return to Home)

---

#### 2.3 Access Non-Existent Board

**Objective:** Verify 404 handling for invalid board IDs

**Steps:**
1. Navigate directly to `http://localhost:3000/boards/invalid-board-id-12345`
2. Wait for page load

**Expected Results:**
- Next.js 404 page is displayed
- `notFound()` function is called by the page component
- No server error (500) occurs
- User can navigate back to home

---

#### 2.4 View Board with Description

**Objective:** Verify description display on board details page

**Setup:** Create a board with title "Marketing Campaign" and description "Q1 2025 Marketing Tasks"

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click on the "Marketing Campaign" board
3. Observe the header section

**Expected Results:**
- Board title "Marketing Campaign" is displayed as `h1`
- Description "Q1 2025 Marketing Tasks" is displayed below the title
- Description has muted foreground color (`text-muted-foreground`)

---

#### 2.5 View Board Without Description

**Objective:** Verify UI when board has no description

**Setup:** Create a board with only a title, no description

**Steps:**
1. Navigate to the board details page
2. Observe the header section

**Expected Results:**
- Only the board title is displayed
- No empty description element is rendered
- Header layout adjusts appropriately
- No empty space where description would be

---

### 3. Column Management

**Seed:** `tests/seed.spec.ts`

#### 3.1 Create New Column with Default Settings

**Objective:** Verify basic column creation functionality

**Setup:** Navigate to any board details page

**Steps:**
1. Navigate to a board details page
2. Locate the "新しいカラムを追加" (Add New Column) button
3. Click the button
4. Verify the inline form appears
5. Type "To Do" in the column name input field
6. Verify the default color (red #ef4444) is pre-selected
7. Click the check mark button (追加/Add) to submit

**Expected Results:**
- Inline form closes
- New column appears on the left side of the column area
- Column header displays:
  - Colored dot indicator (red)
  - Title "To Do"
  - Task count "0"
- Column has muted background (`bg-muted/50`)
- Empty state message: "タスクがありません" (No tasks)
- "タスクを追加" (Add Task) button is visible at the bottom

**Element Identifiers:**
- Add column button: `Button[variant="ghost"]` with border-dashed
- Column name input: `Input[placeholder="カラム名を入力"]`
- Submit button: `Button[type="submit"]` with Check icon
- Cancel button: `Button[type="button"]` with X icon

---

#### 3.2 Create Column with Custom Color

**Objective:** Verify color selection functionality

**Setup:** Navigate to any board details page

**Steps:**
1. Click "新しいカラムを追加" button
2. Type "In Progress" in the column name input
3. Locate the color picker section (label: "カラー")
4. Click the emerald green color button (#10b981 - third option)
5. Verify the selected color has a foreground border
6. Click the check mark button to submit

**Expected Results:**
- New column is created with emerald green color indicator
- Column dot displays the selected color (#10b981)
- Color selection persists after creation
- Column is visually distinct from other columns

**Available Colors:**
- Red: #ef4444 (red-500)
- Amber: #f59e0b (amber-500)
- Emerald: #10b981 (emerald-500)
- Blue: #3b82f6 (blue-500)
- Violet: #8b5cf6 (violet-500)
- Pink: #ec4899 (pink-500)
- Slate: #64748b (slate-500)
- Gray: #6b7280 (gray-500)

---

#### 3.3 Cancel Column Creation

**Objective:** Verify cancel functionality for column creation

**Steps:**
1. Click "新しいカラムを追加" button
2. Type "Test Column" in the input field
3. Select a different color (e.g., blue)
4. Click the X (cancel) button

**Expected Results:**
- Inline form closes immediately
- No column is created
- "新しいカラムを追加" button reappears
- Form state is reset (empty input, default color)

**Alternative Path:**
- Press `Escape` key instead of clicking cancel
- Same expected results

---

#### 3.4 Create Column with Empty Name

**Objective:** Verify validation for required column name

**Steps:**
1. Click "新しいカラムを追加" button
2. Leave the input field empty
3. Try to click the check mark button

**Expected Results:**
- Submit button is disabled when input is empty
- Button has `disabled={!title.trim() || isSubmitting}` attribute
- No column is created
- Form remains open

---

#### 3.5 Create Column with Long Name

**Objective:** Test character limit for column names

**Steps:**
1. Click "新しいカラムを追加" button
2. Type a 60-character string in the input field
3. Attempt to type more characters

**Expected Results:**
- Input field limits to 50 characters (`maxLength={50}`)
- No more characters can be entered beyond the limit
- User can still submit with 50 characters
- Column displays the full name

---

#### 3.6 Create Column During Pending State

**Objective:** Verify form state during submission

**Steps:**
1. Click "新しいカラムを追加" button
2. Type "Test Column"
3. Click the submit button
4. Observe the button state during submission

**Expected Results:**
- Submit button text changes to "追加中..." (Adding...)
- Submit button becomes disabled
- Input field becomes disabled
- Color picker buttons become disabled
- Form prevents multiple submissions

---

#### 3.7 Create Multiple Columns

**Objective:** Verify multiple columns can be created and positioned correctly

**Steps:**
1. Create column "To Do" with red color
2. Create column "In Progress" with amber color
3. Create column "Review" with blue color
4. Create column "Done" with emerald color

**Expected Results:**
- All 4 columns are displayed horizontally
- Columns are ordered by creation order (position field)
- Each column has width `w-80` (320px)
- Columns have horizontal gap spacing (`gap-6`)
- Horizontal scroll appears if columns exceed viewport width
- Each column maintains independent state

---

#### 3.8 View Column with Task Count

**Objective:** Verify task count display updates correctly

**Setup:** Create a column and add tasks to it (covered in later scenarios)

**Expected Results:**
- Column header shows accurate task count
- Count updates when tasks are added
- Count updates when tasks are removed
- Count updates when tasks are moved between columns
- Count is displayed next to column title in muted color

---

### 4. Task Creation and Management

**Seed:** `tests/seed.spec.ts`

#### 4.1 Create Task with Title Only

**Objective:** Verify minimal task creation with required fields only

**Setup:** Create a board with at least one column

**Steps:**
1. Navigate to a board with a column (e.g., "To Do")
2. Locate the "タスクを追加" (Add Task) button at the bottom of the column
3. Click the button
4. Verify the task creation dialog opens with title "新規タスク作成"
5. Verify dialog description: "新しいタスクの詳細を入力してください。"
6. Type "Implement user authentication" in the title field (id: "title")
7. Leave all optional fields blank
8. Click the "作成" (Create) button

**Expected Results:**
- Dialog closes automatically
- New task card appears in the column
- Task card displays:
  - Title: "Implement user authentication"
  - Priority badge: "中" (Medium) - default priority
  - No description text
  - No due date
- Task count in column header increments by 1
- Task has white background with border
- Task has hover shadow effect

**Element Identifiers:**
- Add task button: `Button[variant="ghost"]` with Plus icon and "タスクを追加" text
- Dialog title input: `#title`
- Dialog description textarea: `#description`
- Priority select: `Select` component
- Due date button: `Button[variant="outline"]` with Calendar icon
- Submit button: `Button[type="submit"]`

---

#### 4.2 Create Task with All Fields

**Objective:** Verify task creation with complete information

**Setup:** Create a board with a column named "Development"

**Steps:**
1. Navigate to the "Development" column
2. Click "タスクを追加" button
3. Enter title: "Design database schema"
4. Enter description: "Create ER diagram and define all tables, relationships, and indexes for the new feature"
5. Click the priority dropdown
6. Select "高" (HIGH) from the options
7. Click the due date button (shows "期限を選択（任意）")
8. Select a date from the calendar (e.g., 7 days from today)
9. Verify the date displays in Japanese format (e.g., "2025年10月19日")
10. Click "作成" button

**Expected Results:**
- Task card displays all entered information:
  - Title: "Design database schema"
  - Description: "Create ER diagram and..." (truncated)
  - Priority badge: "高" (High) with appropriate color
  - Due date in Japanese format at bottom right
- Task is positioned at the bottom of the column
- All data is saved to database

**Priority Options:**
- 低 (LOW)
- 中 (MEDIUM)
- 高 (HIGH)
- 緊急 (URGENT)

---

#### 4.3 Create Task with LOW Priority

**Objective:** Verify LOW priority task display

**Steps:**
1. Click "タスクを追加" in any column
2. Enter title: "Update documentation"
3. Change priority to "低" (LOW)
4. Click "作成"

**Expected Results:**
- Task is created with "低" priority badge
- Badge has appropriate color styling (based on `getPriorityColor` function)
- Task appears in the column

---

#### 4.4 Create Task with URGENT Priority

**Objective:** Verify URGENT priority task display

**Steps:**
1. Click "タスクを追加" in any column
2. Enter title: "Fix production bug"
3. Change priority to "緊急" (URGENT)
4. Click "作成"

**Expected Results:**
- Task is created with "緊急" priority badge
- Badge has prominent color styling for urgent items
- Task is visually distinct to indicate urgency

---

#### 4.5 Create Task with Future Due Date

**Objective:** Verify calendar date selection and formatting

**Steps:**
1. Click "タスクを追加" button
2. Enter title: "Quarterly review"
3. Click the due date button
4. Navigate to next month in the calendar
5. Select a date (e.g., 15th)
6. Verify the button text updates to show selected date
7. Click "作成"

**Expected Results:**
- Selected date is displayed in Japanese format (YYYY年MM月DD日)
- Task card shows the due date in smaller format
- Date is stored correctly in database
- No overdue indicator is shown for future dates

---

#### 4.6 Create Task with Past Due Date (Overdue)

**Objective:** Verify overdue task indicator

**Steps:**
1. Click "タスクを追加" button
2. Enter title: "Overdue task test"
3. Select a date in the past (e.g., yesterday)
4. Click "作成"

**Expected Results:**
- Task is created with the past date
- Task card displays:
  - Red border (2px, `border-red-500`)
  - Warning icon ⚠️ next to title
  - Due date in red color (`text-red-600`) with bold font
- Column header shows overdue count badge:
  - Red background badge: "期限切れ X" (X = count of overdue tasks)
  - Badge only appears if overdue tasks exist

**Visual Indicators:**
- Task: `border-2 border-red-500`
- Date: `text-red-600 font-medium`
- Column badge: `bg-red-100 text-red-800`

---

#### 4.7 Create Task Without Due Date

**Objective:** Verify optional due date field

**Steps:**
1. Click "タスクを追加" button
2. Enter title: "Task without deadline"
3. Do not select any due date
4. Click "作成"

**Expected Results:**
- Task is created successfully
- Task card shows no due date information
- No empty date placeholder is displayed
- Task has normal border (no red overdue border)

---

#### 4.8 Create Task with Long Title and Description

**Objective:** Test text overflow handling

**Steps:**
1. Click "タスクを追加" button
2. Enter a title with 150 characters
3. Enter a description with 500 characters
4. Select MEDIUM priority
5. Click "作成"

**Expected Results:**
- Task is created with all text saved
- Title is displayed in full (or wrapped if needed)
- Description is truncated with ellipsis
- Task card maintains fixed width (`w-80` column constraint)
- Text does not break layout

---

#### 4.9 Cancel Task Creation

**Objective:** Verify cancel functionality and state cleanup

**Steps:**
1. Click "タスクを追加" button
2. Enter title: "Test task"
3. Enter description: "Test description"
4. Select HIGH priority
5. Select a due date
6. Click "キャンセル" (Cancel) button

**Expected Results:**
- Dialog closes immediately
- No task is created
- Column remains unchanged
- Form state is reset for next use

---

#### 4.10 Create Task During Pending State

**Objective:** Verify submit button disabled state during creation

**Steps:**
1. Click "タスクを追加" button
2. Enter title: "Test task"
3. Click "作成" button
4. Immediately observe button state

**Expected Results:**
- Submit button text changes to "作成中..." (Creating...)
- Submit button is disabled
- Multiple submissions are prevented
- Dialog closes after successful creation

---

#### 4.11 Create Multiple Tasks in Same Column

**Objective:** Verify task ordering and position management

**Steps:**
1. Create task "Task 1" in "To Do" column
2. Create task "Task 2" in "To Do" column
3. Create task "Task 3" in "To Do" column

**Expected Results:**
- All 3 tasks appear in the column
- Tasks are ordered by creation time (newest at bottom)
- Each task has unique position value in database
- Task count shows "3" in column header
- Tasks are vertically spaced with gap (`space-y-2`)

---

#### 4.12 View Empty Column State

**Objective:** Verify empty state message in columns without tasks

**Steps:**
1. View a column that has no tasks
2. Observe the column content area

**Expected Results:**
- Empty state message is displayed: "タスクがありません"
- Message is centered with vertical padding (`text-center py-8`)
- Message has muted foreground color
- "タスクを追加" button is still visible and functional

---

### 5. Drag and Drop Functionality

**Seed:** `tests/seed.spec.ts`

#### 5.1 Drag Task Within Same Column (Reorder)

**Objective:** Verify task reordering within a single column

**Setup:**
- Create board "Project Board"
- Create column "To Do"
- Create 3 tasks: "Task A", "Task B", "Task C" (in this order)

**Steps:**
1. Navigate to the board page
2. Locate "Task C" (bottom task) in the "To Do" column
3. Click and hold on "Task C" card
4. Observe drag start visual feedback
5. Drag the task upward over "Task A"
6. Release the mouse button

**Expected Results:**
- **Drag Start:**
  - Dragged task becomes semi-transparent (opacity-50)
  - Dragged task rotates 5 degrees
  - Dragged task scales up 105%
  - Cursor changes to grabbing
  - Drag overlay shows rotated version (3deg) at 105% scale

- **During Drag:**
  - Other tasks shift position to show drop target
  - Visual feedback is smooth (200ms transition)

- **After Drop:**
  - Task order becomes: "Task C", "Task B", "Task A"
  - All visual effects reset (opacity, rotation, scale)
  - Position is saved to database
  - Page does not reload (optimistic update)
  - Tasks maintain their content and properties

**Technical Details:**
- Uses `@dnd-kit/sortable` with `verticalListSortingStrategy`
- Requires 3px mouse movement to activate drag (`activationConstraint: distance: 3`)
- Position updates via `updateTaskPosition` action

---

#### 5.2 Drag Task to Different Column

**Objective:** Verify moving tasks between columns

**Setup:**
- Create columns: "To Do", "In Progress", "Done"
- Create task "Implement feature X" in "To Do" column

**Steps:**
1. Locate "Implement feature X" in "To Do" column
2. Click and hold on the task card
3. Drag the task horizontally over the "In Progress" column
4. Observe the column highlight when hovering
5. Release the mouse button over "In Progress" column

**Expected Results:**
- **During Drag:**
  - "In Progress" column background changes to darker muted color (`bg-muted/80`)
  - "In Progress" column gets a primary color ring (`ring-2 ring-primary/50`)
  - Hover state has smooth transition (200ms)

- **After Drop:**
  - Task disappears from "To Do" column
  - Task appears at the bottom of "In Progress" column
  - "To Do" task count decrements by 1
  - "In Progress" task count increments by 1
  - Task maintains all properties (title, description, priority, due date)
  - Database updates via `moveTaskBetweenColumns` action
  - Optimistic update provides immediate feedback

**Database Changes:**
- Task's `columnId` field updates to new column ID
- Task's `position` field updates to last position in new column

---

#### 5.3 Drag Task Over Multiple Columns

**Objective:** Verify visual feedback when dragging across multiple columns

**Setup:**
- Create 4 columns: "Backlog", "To Do", "In Progress", "Done"
- Create task in "Backlog"

**Steps:**
1. Start dragging task from "Backlog"
2. Move mouse slowly over "To Do" column (pause)
3. Continue to "In Progress" column (pause)
4. Continue to "Done" column
5. Drop in "Done" column

**Expected Results:**
- Each column highlights as cursor enters it
- Previous column unhighlights as cursor leaves
- Highlight ring appears only on hovered column
- Task moves directly from "Backlog" to "Done" (not to intermediate columns)
- Only one database update occurs (final position)

---

#### 5.4 Drag and Cancel (Drop Outside)

**Objective:** Verify behavior when drag is cancelled

**Steps:**
1. Start dragging a task from any column
2. Move the task outside the column area
3. Release the mouse button

**Expected Results:**
- Task returns to original position
- No database update occurs
- Visual effects reset
- Column states return to normal

---

#### 5.5 Drag Task to Empty Column

**Objective:** Verify dropping into column with no tasks

**Setup:**
- Create column "Review" (empty)
- Create task "Code review needed" in "To Do" column

**Steps:**
1. Drag "Code review needed" from "To Do"
2. Drop it into empty "Review" column

**Expected Results:**
- Task appears in "Review" column
- Empty state message disappears
- Task is positioned at the top (position 0)
- "Review" column count shows "1"
- "To Do" column count decrements

---

#### 5.6 Rapid Consecutive Drags

**Objective:** Verify system handles multiple quick drag operations

**Setup:** Create multiple tasks in a column

**Steps:**
1. Quickly drag task A from position 0 to position 3
2. Immediately drag task B from position 1 to position 2
3. Immediately drag task C to a different column

**Expected Results:**
- All operations complete successfully
- Optimistic updates provide immediate feedback
- Final state matches database state
- No race conditions or position conflicts occur
- No duplicate tasks appear

---

#### 5.7 Drag Task Between Non-Adjacent Columns

**Objective:** Verify long-distance column moves

**Setup:**
- Create 5 columns spread across the screen
- Create task in first column

**Steps:**
1. Drag task from column 1 to column 5 (skip columns 2, 3, 4)
2. Drop in column 5

**Expected Results:**
- Task successfully moves to column 5
- Intermediate columns are not affected
- Only source and target columns update their counts
- Horizontal scroll (if present) does not interfere with drag

---

#### 5.8 Drag Overdue Task

**Objective:** Verify overdue tasks maintain visual indicators when dragged

**Setup:** Create task with past due date (shows red border)

**Steps:**
1. Drag the overdue task to another column
2. Observe during drag and after drop

**Expected Results:**
- During drag: Task overlay shows red border and warning icon
- After drop: Task maintains red border, warning icon, and red date text
- Overdue count badge updates on both source and target columns
- Due date is preserved across columns

---

#### 5.9 Drag Task with Different Priorities

**Objective:** Verify priority indicators maintain during drag operations

**Steps:**
1. Create 4 tasks with different priorities (LOW, MEDIUM, HIGH, URGENT)
2. Drag each task to different columns
3. Drag tasks to reorder within columns

**Expected Results:**
- Priority badges remain visible during drag
- Badge colors are preserved in drag overlay
- Priority values are maintained after drop
- Visual distinction between priorities is clear throughout operation

---

#### 5.10 Drag Multiple Tasks in Sequence

**Objective:** Verify position calculations remain accurate with sequential moves

**Setup:**
- Column A: Task 1, Task 2, Task 3, Task 4
- Column B: Empty

**Steps:**
1. Drag Task 1 from Column A to Column B
2. Drag Task 3 from Column A to Column B
3. Drag Task 2 from Column A to Column B
4. Verify final order in both columns

**Expected Results:**
- Column B shows tasks in drop order: Task 1, Task 3, Task 2
- Column A shows only: Task 4
- All position values are sequential (0, 1, 2, etc.)
- No position gaps or duplicates
- Task counts are accurate on both columns

---

### 6. Visual Feedback and UI States

**Seed:** `tests/seed.spec.ts`

#### 6.1 Verify Task Hover Effects

**Objective:** Test task card hover interactions

**Steps:**
1. Create a task in any column
2. Move mouse over the task card
3. Observe visual changes
4. Move mouse away

**Expected Results:**
- On hover: Shadow increases (`hover:shadow-md`)
- Transition is smooth (200ms duration)
- Cursor changes to grab/grabbing
- Hover state resets when mouse leaves

---

#### 6.2 Verify Column Overflow Scrolling

**Objective:** Test horizontal scroll with many columns

**Steps:**
1. Create 8 columns (more than viewport width)
2. Observe horizontal scroll behavior

**Expected Results:**
- Horizontal scrollbar appears (`overflow-x-auto`)
- Each column maintains 320px width (`w-80`)
- Columns maintain 24px gap (`gap-6`)
- Bottom padding prevents scrollbar overlap (`pb-4`)
- Scroll is smooth and responsive

---

#### 6.3 Verify Loading States

**Objective:** Test loading indicators during async operations

**Steps:**
1. Create board/task/column
2. Observe button states during creation

**Expected Results:**
- Board creation button: "送信中..." while pending
- Task creation button: "作成中..." while pending
- Column creation button: "追加中..." while pending
- Buttons are disabled during pending state
- Loading state is cleared after completion

---

#### 6.4 Verify Responsive Layout on Mobile

**Objective:** Test mobile viewport layouts

**Steps:**
1. Resize browser to mobile width (375px)
2. Navigate through all pages

**Expected Results:**
- Board grid shows single column
- Columns stack vertically or scroll horizontally
- Dialogs are responsive (sm:max-w-[425px])
- Touch interactions work for drag and drop
- Text remains readable
- Buttons are appropriately sized for touch

---

#### 6.5 Verify Task Description Truncation

**Objective:** Test text overflow in task cards

**Setup:** Create task with long description

**Expected Results:**
- Title wraps to multiple lines if needed
- Description truncates with ellipsis
- Card maintains consistent height
- No layout overflow occurs

---

### 7. Data Persistence and State Management

**Seed:** `tests/seed.spec.ts`

#### 7.1 Verify Optimistic Updates

**Objective:** Test immediate UI feedback before server response

**Steps:**
1. Enable network throttling (slow 3G)
2. Drag a task between columns
3. Observe UI updates

**Expected Results:**
- Task moves immediately in UI (optimistic update)
- Server request happens in background
- No loading spinner during drag
- UI reverts if server request fails (error handling)

---

#### 7.2 Verify Page Refresh Persistence

**Objective:** Test data persistence across page reloads

**Steps:**
1. Create board, columns, and tasks
2. Drag tasks to different positions
3. Refresh the page (F5)

**Expected Results:**
- All boards, columns, and tasks reappear
- Task positions are preserved
- Task properties (priority, due date) are maintained
- Column colors are preserved
- No data loss occurs

---

#### 7.3 Verify Browser Back/Forward Navigation

**Objective:** Test navigation state

**Steps:**
1. Navigate from home to board details
2. Click browser back button
3. Click browser forward button

**Expected Results:**
- Back button returns to home page
- Forward button returns to board page
- Board state is preserved
- No stale data is displayed

---

### 8. Error Handling and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 8.1 Handle Database Connection Error

**Objective:** Test behavior when database is unavailable

**Steps:**
1. Stop PostgreSQL service
2. Try to load the application
3. Attempt to create a board

**Expected Results:**
- Error page or message is displayed
- Application does not crash
- User-friendly error message shown
- Console shows appropriate error logs

---

#### 8.2 Handle Invalid Form Submissions

**Objective:** Test XSS and injection prevention

**Steps:**
1. Attempt to create board with `<script>alert('XSS')</script>` as title
2. Attempt SQL injection in text fields
3. Submit form

**Expected Results:**
- Special characters are escaped
- No script execution occurs
- Data is safely stored
- Display shows escaped text

---

#### 8.3 Handle Network Failures During Operations

**Objective:** Test resilience to network issues

**Steps:**
1. Start drag operation
2. Disable network
3. Complete drop
4. Re-enable network

**Expected Results:**
- Optimistic update shows in UI
- Error handling catches failed request
- User is notified of failure (if implemented)
- State can be recovered

---

#### 8.4 Handle Concurrent Updates

**Objective:** Test behavior when multiple users edit same board

**Steps:**
1. Open board in two browser windows
2. Add task in window 1
3. Add task in window 2
4. Refresh both windows

**Expected Results:**
- Both tasks are saved
- No data overwrites occur
- Position conflicts are resolved
- Both windows show consistent state after refresh

---

## Test Execution Guidelines

### Test Order Recommendations

1. **Initial Setup Tests**: Board creation and navigation (Scenarios 1-2)
2. **Basic CRUD Tests**: Column and task creation (Scenarios 3-4)
3. **Advanced Functionality**: Drag and drop (Scenario 5)
4. **UI/UX Tests**: Visual feedback and responsiveness (Scenario 6)
5. **Stability Tests**: Persistence and error handling (Scenarios 7-8)

### Pass/Fail Criteria

**Pass**: All expected results are achieved, no console errors, data integrity maintained

**Fail**: Any expected result is not met, console errors occur, data corruption, or application crash

### Test Data Cleanup

After each major test section, consider resetting the database:

```bash
docker-compose down -v
docker-compose up -d
npx prisma db push
```

### Performance Benchmarks

- Page load: < 1 second
- Dialog open: < 200ms
- Drag operation: < 100ms response time
- Database operations: < 500ms

---

## Known Limitations and Future Enhancements

### Current Limitations

1. No user authentication (single-user application)
2. No real-time collaboration features
3. No undo/redo functionality
4. Limited error rollback for failed operations
5. No task editing/deletion UI (may need to be added)

### Accessibility Considerations

- Back button has aria-label for screen readers
- Form inputs have proper labels
- Color is not the only indicator for priority (text labels included)
- Keyboard navigation for dialogs (Escape to close)

---

## Appendix: Element Reference

### Common Selectors

```typescript
// Buttons
"新規ボード作成" - Board creation trigger
"タスクを追加" - Task creation trigger
"新しいカラムを追加" - Column creation trigger
"作成" / "追加" - Submit buttons
"キャンセル" - Cancel buttons

// Form Fields
#title - Title input (board/task)
#description - Description textarea (board/task)
#priority - Priority select (task)

// Icons
Plus - Add/create actions
ArrowLeft - Back navigation
Calendar - Date picker trigger
Check - Confirm/submit
X - Cancel/close

// States
"送信中..." - Board submitting
"作成中..." - Task creating
"追加中..." - Column adding
```

### Color Codes

```typescript
Priority Colors (from getPriorityColor):
- LOW: Light badge color
- MEDIUM: Medium badge color
- HIGH: Prominent badge color
- URGENT: High-contrast urgent color

Column Colors:
- Red: #ef4444
- Amber: #f59e0b
- Emerald: #10b981
- Blue: #3b82f6
- Violet: #8b5cf6
- Pink: #ec4899
- Slate: #64748b
- Gray: #6b7280
```

---

## Test Report Template

### Test Execution Summary

- **Test Date**: [Date]
- **Tester**: [Name]
- **Environment**: [Browser, OS, Database version]
- **Total Scenarios**: 70+
- **Passed**: [Number]
- **Failed**: [Number]
- **Blocked**: [Number]
- **Execution Time**: [Hours]

### Failed Test Details

| Scenario ID | Description | Expected | Actual | Severity | Notes |
|-------------|-------------|----------|--------|----------|-------|
| 1.1 | ... | ... | ... | High/Medium/Low | ... |

### Recommendations

[List of improvements or bug fixes needed]

---

**Document Version**: 1.0
**Last Updated**: 2025-10-12
**Application Version**: Next.js 15.3.3, React 19
**Test Coverage**: Board Management, Column Management, Task Management, Drag & Drop, UI/UX, Data Persistence, Error Handling
