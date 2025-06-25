english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%9C%81%E5%8A%9B/AutoClickElementLib/README.zh-Hant.md)
# AutoClick Library

Many scripts on GreasyFork aim to simply "click element X Y times."  
This library allows developers to define automatic click rules based on URL patterns (regular expressions) and CSS/XPath selectors,  
supporting single or continuous clicks, link navigation, and customizable click intervals.

## Features

- **Rule Management**: Supports CRUD operations for click rules, including validation of URL regular expressions and selectors, as well as duplicate rule checks.
- **Task Management**: Supports scheduling and management of click tasks, with a debounce mechanism.
- **Selector Support**: Supports CSS and XPath selectors, with the ability to specify the index of the matched elements, eliminating the need for selectors that return a unique value.
- **Configurable Behavior**: Supports continuous clicking, link navigation, and customizable click intervals.

## Including the Library

1. Ensure your browser has Violentmonkey or another userscript manager installed.
2. Create a new userscript and include the following metadata:
```JavaScript
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_info
// @require https://update.greasyfork.org/scripts/540647/1613497/%E8%87%AA%E5%8B%95%E9%BB%9E%E9%81%B8%E5%85%83%E7%B4%A0%E5%87%BD%E5%BC%8F%E5%BA%AB.js
```
3. Create and initialize the library instance: `this.clickLib = new ClickItForYou();`.

## Rules

Each rule is an object with the following properties:

| Property        | Type    | Description                                      | Required | Default Value        |
|-----------------|---------|--------------------------------------------------|----------|----------------------|
| `ruleName`      | string  | Name of the rule for identification              | No       | `Rule N` (N = index+1) |
| `urlPattern`    | string  | Regular expression to match URLs                 | Yes      | None                 |
| `selector`      | string  | CSS or XPath selector                            | Yes      | None                 |
| `selectorType`  | string  | Selector type, must be `"css"` or `"xpath"`      | Yes      | None                 |
| `nthElement`    | number  | Which matching element to click (1-based)        | No       | 1                    |
| `clickDelay`    | number  | Click interval (milliseconds)                    | No       | 1000                 |
| `keepClicking`  | boolean | Whether to continue clicking after first success | No       | false                |
| `ifLinkOpen`    | boolean | Whether to navigate if the target is an `<a>`    | No       | false                |

**Notes**:
- `urlPattern` must be a valid regular expression, or a validation error will be triggered.
- `selectorType` only supports `"css"` or `"xpath"`; other values will invalidate the rule.
- When `ruleName`, `urlPattern`, and `selector` are all consistent with the old rule,  
  it will be considered a duplicate rule and will not be allowed to be added to rules by clickLib.addRule().
## API Reference

### `ClickItForYou` Methods

#### `addRule(rule)`
Adds a new click rule with basic validation and duplicate checking.
- **Parameter**: `rule` (Object) - Rule object, structured as above.
- **Returns**: `{ success: boolean, error: string|null }`
  - `success`: `true` if added successfully, `false` if failed.
  - `error`: Error message if failed (e.g., duplicate rule or invalid regex).

#### `getRules([filter])`
Retrieves click rules, optionally filtered by URL.
- **Parameter**: `filter` (string, optional) - URL filter condition, defaults to `null` (returns all rules).
- **Returns**: `{ success: boolean, data: Array<Object>, error: string|null }`
  - `data`: Array of matching rules.

#### `updateRule(index, rule)`
Updates the rule at the specified index and restarts tasks.
- **Parameters**:
  - `index` (number) - Rule index (0-based).
  - `rule` (Object) - Updated rule object.
- **Returns**: `{ success: boolean, error: string|null }`

#### `deleteRule(index)`
Deletes the rule at the specified index and restarts tasks.
- **Parameter**: `index` (number) - Rule index (0-based).
- **Returns**: `{ success: boolean, error: string|null }`

#### `addTask(ruleIndex)`
Adds a click task for the specified rule.
- **Parameter**: `ruleIndex` (number) - Rule index (0-based).
- **Returns**: `{ success: boolean, taskId: number, error: string|null }`
  - `taskId`: The `setInterval` ID of the task.

#### `runTasks()`
Starts all unstarted tasks for rules, using a debounce mechanism.
- **Parameters**: None.
- **Returns**: `{ success: boolean, error: string|null }`

#### `clearTasks()`
Clears all running tasks.
- **Parameters**: None.
- **Returns**: `{ success: boolean, data: { clearedCount: number }, error: string|null }`
  - `clearedCount`: Number of tasks cleared.

## Usage Examples
### Managing Rules

```JavaScript
// Define a new rule
const newRule = {
  ruleName: "Example Rule",
  urlPattern: "https://example.com/.*",
  selector: "button#submit",
  selectorType: "css",
  nthElement: 1,
  clickDelay: 1000,
  keepClicking: false,
  ifLinkOpen: false
};

// Add the rule
const addResult = clickLib.addRule(newRule);
if (addResult.success) {
  console.log("Rule added successfully");
} else {
  console.error(addResult.error);
}

// Get rules for the current URL
const rules = clickLib.getRules(window.location.href);
console.log(rules.data);

// Update a rule
clickLib.updateRule(0, { ...newRule, clickDelay: 500 });

// Delete a rule
clickLib.deleteRule(0);
```

### Managing Tasks

```JavaScript
// Start the task for rule at index 0
const oneTaskResult = clickLib.addTask(0);
if (oneTaskResult.success) {
  console.log(`Task added successfully, Task ID: ${oneTaskResult.taskId}`);
} else {
  console.error("Failed to add task:", oneTaskResult.error);
}

// Start all tasks matching the current URL pattern
const allTaskResult = clickLib.runTasks();
if (allTaskResult.success) {
  console.log("All tasks started");
} else {
  console.error("Failed to start tasks:", allTaskResult.error);
}

// Clear tasks (must clear successful but incomplete tasks before restarting)
const clearTasksResult = clickLib.clearTasks();
if (clearTasksResult.success) {
  console.log(`Cleared ${clearTasksResult.data.clearedCount} tasks`);
} else {
  console.error("Failed to clear tasks:", clearTasksResult.error);
}
```

## License
This project is licensed under the Mozilla Public License 2.0 (MPL 2.0). See [LICENSE](https://www.mozilla.org/en-US/MPL/2.0/) for details.
