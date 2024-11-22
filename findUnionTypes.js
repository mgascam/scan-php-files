const fs = require('fs');
const path = require('path');

// Function to recursively find PHP files in a directory
function getPhpFiles(dir) {
    let phpFiles = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            phpFiles = phpFiles.concat(getPhpFiles(fullPath));
        } else if (file.endsWith('.php')) {
            phpFiles.push(fullPath);
        }
    }

    return phpFiles;
}

// Function to search for matching lines with line numbers
function findMatchesInFile(filePath, regex) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const matches = [];

    lines.forEach((line, index) => {
        if (regex.test(line)) {
            matches.push({ lineNumber: index + 1, line });
        }
    });

    return matches;
}

// Function to generate JSON output
function generateJsonOutput(results, outputFilename) {
    const jsonOutput = JSON.stringify(results, null, 2);
    fs.writeFileSync(outputFilename, jsonOutput);
    console.log(`Results written to ${outputFilename}`);
}

// Function to generate HTML output
function generateHtmlOutput(results, outputFilename) {
    let htmlOutput = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Union Types Report</title>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid black; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Union Types Report</h1>
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>Line Number</th>
        <th>Code</th>
      </tr>
    </thead>
    <tbody>
`;

    results.forEach(({ file, matches }) => {
        matches.forEach(({ lineNumber, line }) => {
            htmlOutput += `
      <tr>
        <td>${file}</td>
        <td>${lineNumber}</td>
        <td>${line}</td>
      </tr>
`;
        });
    });

    htmlOutput += `
    </tbody>
  </table>
</body>
</html>
`;

    fs.writeFileSync(outputFilename, htmlOutput);
    console.log(`Results written to ${outputFilename}`);
}

// Function to get a unique filename to avoid overwriting
function getUniqueFilename(baseName, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${baseName}-${timestamp}.${extension}`;
}

// Main function
function main() {
    // Get command line arguments
    const args = process.argv.slice(2);
    const formatArg = args.find(arg => arg.startsWith('--format='));
    const directoryArg = args.find(arg => arg.startsWith('--directory='));
    const patternArg = args.find(arg => arg.startsWith('--pattern='));

    // Determine the output format
    const format = formatArg === '--format=json' ? 'json'
        : formatArg === '--format=html' ? 'html'
            : null;

    if (!format) {
        console.error('Usage: node findUnionTypes.js --format=json|html --directory=PATH --pattern=REGEX');
        process.exit(1);
    }

    // Determine the directory to search
    const directory = directoryArg ? directoryArg.replace('--directory=', '') : null;

    if (!directory) {
        console.error('Usage: node findUnionTypes.js --format=json|html --directory=PATH --pattern=REGEX');
        process.exit(1);
    }

    // Check if the directory exists
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
        console.error(`Error: Directory "${directory}" does not exist or is not a directory.`);
        process.exit(1);
    }

    // Get the regex pattern
    const pattern = patternArg ? patternArg.replace('--pattern=', '') : '@return.*[^\s]+\|[^\s]+\|[^\s]+';

    // Create the regex object with the pattern
    const returnRegex = new RegExp(pattern);

    // Scan for PHP files and matches
    const phpFiles = getPhpFiles(directory);
    const results = [];

    phpFiles.forEach((file) => {
        const matches = findMatchesInFile(file, returnRegex);

        if (matches.length > 0) {
            results.push({ file, matches });
        }
    });

    // Generate a unique output filename
    const outputFilename = getUniqueFilename('output', format);

    // Generate the specified output
    if (format === 'json') {
        generateJsonOutput(results, outputFilename);
    } else if (format === 'html') {
        generateHtmlOutput(results, outputFilename);
    }
}

main();
