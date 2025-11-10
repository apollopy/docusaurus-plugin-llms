/**
 * Unit tests for category organization helper functions
 * 
 * Run with: node tests/test-category-functions.js
 */

// Reimplement helper functions for testing
function extractCategoryFromPath(docPath) {
  const parts = docPath.replace(/^\/+|\/+$/g, '').split('/');
  
  if (parts.length >= 3) {
    return parts[2];
  } else if (parts.length >= 2) {
    return parts[1];
  }
  
  return 'other';
}

function extractSubdirectoryFromPath(docPath, docsDir) {
  const parts = docPath.replace(/^\/+|\/+$/g, '').replace(/\.mdx?$/, '').split('/');
  
  if (parts.length >= 5 && parts[0] === docsDir) {
    return parts[3];
  }
  
  return null;
}

function formatCategoryName(category) {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Test cases for extractCategoryFromPath
function testExtractCategoryFromPath() {
  console.log('=== Testing extractCategoryFromPath ===\n');
  
  const testCases = [
    {
      input: '/docs/guides/getting-started/introduction',
      expected: 'getting-started',
      name: 'Extract category from docs/guides/category/file path'
    },
    {
      input: 'docs/api/reference/endpoints',
      expected: 'reference',
      name: 'Extract category without leading slash'
    },
    {
      input: '/docs/platform/client-sdk',
      expected: 'client-sdk',
      name: 'Extract category from docs/platform/client-sdk (client-sdk is the category)'
    },
    {
      input: 'docs/platform',
      expected: 'platform',
      name: 'Extract category from two-part path'
    },
    {
      input: 'other',
      expected: 'other',
      name: 'Fallback to other for invalid path'
    },
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach((test, index) => {
    const result = extractCategoryFromPath(test.input);
    if (result === test.expected) {
      console.log(`✅ Test ${index + 1}: ${test.name}`);
      console.log(`   Input: ${test.input} → Output: ${result}`);
      passCount++;
    } else {
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      console.log(`   Input: ${test.input}`);
      console.log(`   Expected: ${test.expected}, Actual: ${result}`);
      failCount++;
    }
  });
  
  console.log(`\nResults: ${passCount} passed, ${failCount} failed out of ${testCases.length} tests.\n`);
  return failCount === 0;
}

// Test cases for extractSubdirectoryFromPath
function testExtractSubdirectoryFromPath() {
  console.log('=== Testing extractSubdirectoryFromPath ===\n');
  
  const testCases = [
    {
      input: '/docs/guides/getting-started/changelog/v1.mdx',
      docsDir: 'docs',
      expected: 'changelog',
      name: 'Extract subdirectory from 5-part path'
    },
    {
      input: 'docs/guides/getting-started/changelog/v2',
      docsDir: 'docs',
      expected: 'changelog',
      name: 'Extract subdirectory without extension'
    },
    {
      input: '/docs/guides/getting-started/license.mdx',
      docsDir: 'docs',
      expected: null,
      name: 'Return null for 4-part path (category root)'
    },
    {
      input: 'docs/api/reference/authentication',
      docsDir: 'docs',
      expected: null,
      name: 'Return null for path without subdirectory'
    },
    {
      input: '/docs/platform/client-sdk/overview.mdx',
      docsDir: 'docs',
      expected: null,
      name: 'Return null for 4-part path'
    },
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach((test, index) => {
    const result = extractSubdirectoryFromPath(test.input, test.docsDir);
    if (result === test.expected) {
      console.log(`✅ Test ${index + 1}: ${test.name}`);
      console.log(`   Input: ${test.input} → Output: ${result === null ? 'null' : result}`);
      passCount++;
    } else {
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      console.log(`   Input: ${test.input}`);
      console.log(`   Expected: ${test.expected === null ? 'null' : test.expected}, Actual: ${result === null ? 'null' : result}`);
      failCount++;
    }
  });
  
  console.log(`\nResults: ${passCount} passed, ${failCount} failed out of ${testCases.length} tests.\n`);
  return failCount === 0;
}

// Test cases for formatCategoryName
function testFormatCategoryName() {
  console.log('=== Testing formatCategoryName ===\n');
  
  const testCases = [
    {
      input: 'getting-started',
      expected: 'Getting Started',
      name: 'Format hyphenated category name'
    },
    {
      input: 'access',
      expected: 'Access',
      name: 'Format single word category name'
    },
    {
      input: 'anti-addiction',
      expected: 'Anti Addiction',
      name: 'Format category with multiple hyphens'
    },
    {
      input: 'tap-cloudsave',
      expected: 'Tap Cloudsave',
      name: 'Format category with prefix'
    },
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach((test, index) => {
    const result = formatCategoryName(test.input);
    if (result === test.expected) {
      console.log(`✅ Test ${index + 1}: ${test.name}`);
      console.log(`   Input: ${test.input} → Output: ${result}`);
      passCount++;
    } else {
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      console.log(`   Input: ${test.input}`);
      console.log(`   Expected: ${test.expected}, Actual: ${result}`);
      failCount++;
    }
  });
  
  console.log(`\nResults: ${passCount} passed, ${failCount} failed out of ${testCases.length} tests.\n`);
  return failCount === 0;
}

// Test URL normalization
function testUrlNormalization() {
  console.log('=== Testing URL Normalization ===\n');
  
  const FILE_EXTENSION_PATTERN = /\.[a-zA-Z0-9]{1,10}$/;
  
  function normalizeUrlPath(url) {
    const pathname = url.pathname;
    if (!pathname.endsWith('/') && !FILE_EXTENSION_PATTERN.test(pathname)) {
      url.pathname = pathname + '/';
    }
    return url.toString();
  }
  
  const testCases = [
    {
      name: 'URL without extension should end with /',
      input: new URL('https://example.com/docs/page', 'https://example.com'),
      expected: 'https://example.com/docs/page/'
    },
    {
      name: 'URL with .html extension should not end with /',
      input: new URL('https://example.com/docs/page.html', 'https://example.com'),
      expected: 'https://example.com/docs/page.html'
    },
    {
      name: 'URL already ending with / should remain unchanged',
      input: new URL('https://example.com/docs/page/', 'https://example.com'),
      expected: 'https://example.com/docs/page/'
    },
    {
      name: 'URL with .md extension should not end with /',
      input: new URL('https://example.com/docs/page.md', 'https://example.com'),
      expected: 'https://example.com/docs/page.md'
    },
    {
      name: 'URL with .pdf extension should not end with /',
      input: new URL('https://example.com/docs/file.pdf', 'https://example.com'),
      expected: 'https://example.com/docs/file.pdf'
    },
    {
      name: 'URL with query parameters should still normalize path',
      input: new URL('https://example.com/docs/page?param=value', 'https://example.com'),
      expected: 'https://example.com/docs/page/?param=value'
    },
    {
      name: 'URL with hash should still normalize path',
      input: new URL('https://example.com/docs/page#section', 'https://example.com'),
      expected: 'https://example.com/docs/page/#section'
    },
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach((test, index) => {
    // Create a new URL object for each test to avoid mutation
    const testUrl = new URL(test.input.toString());
    const result = normalizeUrlPath(testUrl);
    if (result === test.expected) {
      console.log(`✅ Test ${index + 1}: ${test.name}`);
      console.log(`   Result: ${result}`);
      passCount++;
    } else {
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      console.log(`   Expected: ${test.expected}`);
      console.log(`   Actual: ${result}`);
      failCount++;
    }
  });
  
  console.log(`\nResults: ${passCount} passed, ${failCount} failed out of ${testCases.length} tests.\n`);
  return failCount === 0;
}

// Test document sorting
function testDocumentSorting() {
  console.log('=== Testing Document Sorting ===\n');
  
  function sortDocsByPosition(docs) {
    return [...docs].sort((a, b) => {
      const posA = a.frontMatter?.sidebar_position ?? 999;
      const posB = b.frontMatter?.sidebar_position ?? 999;
      if (posA !== posB) {
        return posA - posB;
      }
      return a.path.localeCompare(b.path);
    });
  }
  
  const testDocs = [
    { title: 'Doc C', path: '/docs/sdk/access/doc-c', frontMatter: { sidebar_position: 3 } },
    { title: 'Doc A', path: '/docs/sdk/access/doc-a', frontMatter: { sidebar_position: 1 } },
    { title: 'Doc B', path: '/docs/sdk/access/doc-b', frontMatter: { sidebar_position: 2 } },
    { title: 'Doc D', path: '/docs/sdk/access/doc-d', frontMatter: {} },
  ];
  
  const sorted = sortDocsByPosition(testDocs);
  const expectedOrder = ['Doc A', 'Doc B', 'Doc C', 'Doc D'];
  const actualOrder = sorted.map(doc => doc.title);
  
  const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  
  if (isCorrect) {
    console.log('✅ Documents are sorted correctly by sidebar_position');
    console.log(`   Order: ${actualOrder.join(' → ')}`);
  } else {
    console.log('❌ Documents are not sorted correctly');
    console.log(`   Expected: ${expectedOrder.join(' → ')}`);
    console.log(`   Actual: ${actualOrder.join(' → ')}`);
  }
  
  console.log('');
  return isCorrect;
}

// Main test runner
function runTests() {
  console.log('Starting category organization function tests...\n');
  
  const test1 = testExtractCategoryFromPath();
  const test2 = testExtractSubdirectoryFromPath();
  const test3 = testFormatCategoryName();
  const test4 = testUrlNormalization();
  const test5 = testDocumentSorting();
  
  console.log('=== Test Summary ===');
  console.log(`extractCategoryFromPath: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`extractSubdirectoryFromPath: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`formatCategoryName: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`URL Normalization: ${test4 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Document Sorting: ${test5 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = test1 && test2 && test3 && test4 && test5;
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
  
  return allPassed;
}

// Run tests if executed directly
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests };

