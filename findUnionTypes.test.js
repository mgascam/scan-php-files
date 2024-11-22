const fs = require('fs');
const path = require('path');
const {
    getPhpFiles,
    findMatchesInFile,
    generateJsonOutput,
    generateHtmlOutput,
    getUniqueFilename
} = require('./findUnionTypes');

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('findUnionTypes', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

        it('should find PHP files recursively', () => {
            // Mock filesystem structure
            const mockFiles = {
                '/test': ['file1.php', 'file2.txt', 'subdir'],
                '/test/subdir': ['file3.php']
            };

            fs.readdirSync.mockImplementation(dir => mockFiles[dir]);
            fs.statSync.mockImplementation(path => ({
                isDirectory: () => path.endsWith('subdir')
            }));
            path.join.mockImplementation((dir, file) => `${dir}/${file}`);

            const result = getPhpFiles('/test');

            expect(result).toEqual(['/test/file1.php', '/test/subdir/file3.php']);
        });
    });

    describe('findMatchesInFile', () => {
        it('should find matching lines with line numbers', () => {
            const mockContent = `line1\n@return string|int|bool\nline3`;
            fs.readFileSync.mockReturnValue(mockContent);

            const regex = new RegExp('@return.*[^\\s]+\\|[^\\s]+\\|[^\\s]+');
            const result = findMatchesInFile('test.php', regex);

            expect(result).toEqual([
                { lineNumber: 2, line: '@return string|int|bool' }
            ]);
        });
    });

    describe('generateJsonOutput', () => {
        it('should generate JSON file with results', () => {
            const mockResults = [{ file: 'test.php', matches: [] }];

            generateJsonOutput(mockResults, 'output.json');

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                'output.json',
                JSON.stringify(mockResults, null, 2)
            );
        });
    });

    describe('generateHtmlOutput', () => {
        it('should generate HTML file with results', () => {
            const mockResults = [{
                file: 'test.php',
                matches: [{ lineNumber: 1, line: 'test line' }]
            }];

            generateHtmlOutput(mockResults, 'output.html');

            expect(fs.writeFileSync).toHaveBeenCalled();
            const htmlCall = fs.writeFileSync.mock.calls[0];
            expect(htmlCall[0]).toBe('output.html');
            expect(htmlCall[1]).toContain('<!DOCTYPE html>');
            expect(htmlCall[1]).toContain('test.php');
            expect(htmlCall[1]).toContain('test line');
        });
    });

    describe('getUniqueFilename', () => {
        it('should generate unique filename with timestamp', () => {
            // Mock date
            const mockDate = new Date('2024-01-01T12:00:00.000Z');
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            const result = getUniqueFilename('output', 'json');

            expect(result).toBe('output-2024-01-01T12-00-00-000Z.json');
        });
    });
});