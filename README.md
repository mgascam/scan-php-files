# **Union Types Detector**

This Node.js script scans a specified directory for PHP files and detects `@return` annotations in docblocks with union types containing **three or more types**. It supports generating output in either **JSON** or **HTML** format.

---

## **Features**

- Recursively scans all PHP files in a given directory.
- Detects `@return` annotations with union types of three or more types, e.g.,:
  ```php
  /**
   * @return boolean|WC_Order|WC_Order_Refund
   */

Outputs results in either:
- JSON: A structured, machine-readable format.
- HTML: A human-readable table.

## **Requirements**
- Node.js (v12 or later).
- A PHP project or directory to analyze.

## Command-Line Arguments

The script accepts two arguments:
1. `--format`: Specifies the output format.
   * `json`
   * `html`
2. `--directory`: Specifies the directory to scan.

## Command Examples
**JSON Output**

`node findUnionTypes.js --format=json --directory=./src`

**HTML Output**

`node findUnionTypes.js --format=html --directory=/path/to/php/files`





