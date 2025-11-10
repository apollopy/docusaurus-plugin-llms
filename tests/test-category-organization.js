/**
 * Test script for category organization and URL normalization features
 * 
 * Run with: node tests/test-category-organization.js
 */

const fs = require('fs').promises;
const path = require('path');
const pluginModule = require('../lib/index');
const plugin = pluginModule.default;

// Create test directory structure
const TEST_DIR = path.join(__dirname, '..', 'test-docs');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output', 'category-organization-test');

// Setup test docs structure with categories and subdirectories
async function setupTestDocs() {
  console.log('Setting up test docs with categories...');
  
  // Create directories
  const dirs = [
    'docs/guides/getting-started',
    'docs/guides/getting-started/changelog',
    'docs/api/reference',
    'docs/api/advanced',
    'docs/guides/platform',
    'docs/guides/platform/client-sdk',
    'docs/guides/platform/update-policy',
  ];
  
  for (const dir of dirs) {
    const fullPath = path.join(TEST_DIR, dir);
    await fs.mkdir(fullPath, { recursive: true });
  }
  
  // Create _category_.json files
  await fs.writeFile(
    path.join(TEST_DIR, 'docs/guides/getting-started/_category_.json'),
    JSON.stringify({ label: 'Getting Started', collapsed: true, position: 0 }, null, 2)
  );
  
  await fs.writeFile(
    path.join(TEST_DIR, 'docs/api/reference/_category_.json'),
    JSON.stringify({ label: 'API Reference', collapsed: true, position: 1 }, null, 2)
  );
  
  await fs.writeFile(
    path.join(TEST_DIR, 'docs/api/advanced/_category_.json'),
    JSON.stringify({ label: 'Advanced', collapsed: true, position: 2 }, null, 2)
  );
  
  await fs.writeFile(
    path.join(TEST_DIR, 'docs/guides/getting-started/changelog/_category_.json'),
    JSON.stringify({ label: 'Changelog', collapsed: true, position: 1 }, null, 2)
  );
  
  await fs.writeFile(
    path.join(TEST_DIR, 'docs/guides/platform/_category_.json'),
    JSON.stringify({ label: 'Platform', collapsed: true, position: 3 }, null, 2)
  );
  
  await fs.writeFile(
    path.join(TEST_DIR, 'docs/guides/platform/client-sdk/_category_.json'),
    JSON.stringify({ label: 'Client SDK', collapsed: true, position: 3 }, null, 2)
  );
  
  await fs.writeFile(
    path.join(TEST_DIR, 'docs/guides/platform/update-policy/_category_.json'),
    JSON.stringify({ label: 'Update Policy', collapsed: true, position: 1 }, null, 2)
  );
  
  // Create test markdown files
  const files = [
    {
      path: 'docs/guides/getting-started/overview.mdx',
      content: `---
title: Overview
sidebar_position: 1
description: Overview of the documentation
---

# Overview

Documentation overview content.`
    },
    {
      path: 'docs/guides/getting-started/license.mdx',
      content: `---
title: License
---

# License

License content.`
    },
    {
      path: 'docs/guides/getting-started/changelog/v1.mdx',
      content: `---
title: Version 1
sidebar_position: 1
description: Version 1 release notes
---

# Version 1

Version 1 release notes content.`
    },
    {
      path: 'docs/guides/getting-started/changelog/v2.mdx',
      content: `---
title: Version 2
sidebar_position: 2
description: Version 2 release notes
---

# Version 2

Version 2 release notes content.`
    },
    {
      path: 'docs/api/reference/authentication.mdx',
      content: `---
title: Authentication
sidebar_position: 1
description: Authentication API reference
---

# Authentication

Authentication API methods.`
    },
    {
      path: 'docs/api/reference/setup.mdx',
      content: `---
title: Setup
sidebar_position: 0
---

# Setup

Setup instructions.`
    },
    {
      path: 'docs/guides/platform/client-sdk/overview.mdx',
      content: `---
title: Client SDK Overview
sidebar_position: 1
description: Client SDK integration overview
---

# Client SDK Overview

Integration overview content.`
    },
    {
      path: 'docs/guides/platform/update-policy/index.mdx',
      content: `---
title: Update Policy
sidebar_position: 1
description: Update policy documentation
---

# Update Policy

Update policy content.`
    },
  ];
  
  for (const file of files) {
    await fs.writeFile(
      path.join(TEST_DIR, file.path),
      file.content
    );
  }
  
  console.log('Test docs setup complete.\n');
}

// Test category organization
async function testCategoryOrganization() {
  console.log('=== Testing Category Organization ===\n');
  
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  const context = {
    siteDir: TEST_DIR,
    outDir: OUTPUT_DIR,
    siteConfig: {
      url: 'https://example.com',
      baseUrl: '/',
      title: 'Test Documentation',
      tagline: 'Test documentation site',
      i18n: {
        defaultLocale: 'en',
        locales: ['en']
      }
    }
  };
  
  const options = {
    generateLLMsTxt: true,
    generateLLMsFullTxt: false,
    includeDescriptionInLinks: false,
    includeOrder: ['docs/guides/**', 'docs/api/**'],
    includeUnmatchedLast: false,
  };
  
  const pluginInstance = plugin(context, options);
  
  // Mock the postBuild hook
  const mockProps = {
    outDir: OUTPUT_DIR,
    routesPaths: [],
    routes: []
  };
  
  try {
    await pluginInstance.postBuild(mockProps);
    
    // Read the generated llms.txt
    const llmsTxtPath = path.join(OUTPUT_DIR, 'llms.txt');
    const content = await fs.readFile(llmsTxtPath, 'utf8');
    
    console.log('Generated llms.txt content:');
    console.log('---');
    console.log(content);
    console.log('---\n');
    
    // Test assertions
    let passCount = 0;
    let failCount = 0;
    const tests = [];
    
    // Test 1: Categories are organized
    const hasCategoryHeaders = content.includes('## Getting Started') && content.includes('## API Reference');
    tests.push({
      name: 'Categories are organized with headers',
      pass: hasCategoryHeaders,
      expected: 'Should have category headers like ## Getting Started, ## API Reference',
      actual: hasCategoryHeaders ? 'Found category headers' : 'Missing category headers'
    });
    
    // Test 2: Categories are sorted by position (getting-started should be first)
    const gettingStartedIndex = content.indexOf('## Getting Started');
    const apiReferenceIndex = content.indexOf('## API Reference');
    const advancedIndex = content.indexOf('## Advanced');
    const categoriesSorted = gettingStartedIndex < apiReferenceIndex && apiReferenceIndex < advancedIndex;
    tests.push({
      name: 'Categories are sorted by position',
      pass: categoriesSorted,
      expected: 'getting-started (position 0) should come before api/reference (position 1)',
      actual: categoriesSorted ? 'Categories correctly sorted' : 'Categories not sorted correctly'
    });
    
    // Test 3: Subdirectories are grouped
    const hasSubdirHeader = content.includes('### Changelog');
    tests.push({
      name: 'Subdirectories are grouped with ### headers',
      pass: hasSubdirHeader,
      expected: 'Should have subdirectory header ### Changelog',
      actual: hasSubdirHeader ? 'Found subdirectory header' : 'Missing subdirectory header'
    });
    
    // Test 4: Subdirectories are sorted by position
    const v1Index = content.indexOf('[Version 1]');
    const v2Index = content.indexOf('[Version 2]');
    const subdirDocsSorted = v1Index < v2Index;
    tests.push({
      name: 'Documents in subdirectories are sorted by sidebar_position',
      pass: subdirDocsSorted,
      expected: 'Version 1 (position 1) should come before Version 2 (position 2)',
      actual: subdirDocsSorted ? 'Documents correctly sorted' : 'Documents not sorted correctly'
    });
    
    // Test 5: URLs end with /
    const urlPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const urls = [];
    let match;
    while ((match = urlPattern.exec(content)) !== null) {
      urls.push(match[2]);
    }
    const allUrlsEndWithSlash = urls.every(url => {
      // Check if URL ends with / or has file extension
      return url.endsWith('/') || /\.(html|md|pdf|txt|xml|json)$/i.test(url);
    });
    tests.push({
      name: 'URLs end with / (unless they have file extensions)',
      pass: allUrlsEndWithSlash,
      expected: 'All URLs should end with / or have file extensions',
      actual: `${urls.length} URLs checked, ${urls.filter(u => u.endsWith('/') || /\.(html|md|pdf|txt|xml|json)$/i.test(u)).length} valid`
    });
    
    // Test 6: Descriptions are not included when includeDescriptionInLinks is false
    const hasDescriptions = content.includes(': ') && content.split(': ').length > 1;
    tests.push({
      name: 'Descriptions are not included when includeDescriptionInLinks is false',
      pass: !hasDescriptions,
      expected: 'Should not have descriptions in links',
      actual: hasDescriptions ? 'Found descriptions in links' : 'No descriptions found (correct)'
    });
    
    // Test 7: Root-level documents are listed before subdirectories
    const overviewIndex = content.indexOf('[Overview]');
    const changelogIndex = content.indexOf('### Changelog');
    const rootBeforeSubdir = overviewIndex < changelogIndex;
    tests.push({
      name: 'Root-level documents appear before subdirectories',
      pass: rootBeforeSubdir,
      expected: 'Root documents should appear before ### subdirectory headers',
      actual: rootBeforeSubdir ? 'Root documents correctly positioned' : 'Root documents not positioned correctly'
    });
    
    // Test 8: Subdirectories are sorted by position (update-policy before client-sdk)
    const platformIndex = content.indexOf('## Platform');
    if (platformIndex !== -1) {
      const updatePolicyIndex = content.indexOf('### Update Policy', platformIndex);
      const clientSdkIndex = content.indexOf('### Client SDK', platformIndex);
      const subdirsSorted = updatePolicyIndex !== -1 && clientSdkIndex !== -1 && updatePolicyIndex < clientSdkIndex;
      tests.push({
        name: 'Subdirectories are sorted by position',
        pass: subdirsSorted,
        expected: 'Update Policy (position 1) should come before Client SDK (position 3)',
        actual: subdirsSorted ? 'Subdirectories correctly sorted' : 'Subdirectories not sorted correctly'
      });
    } else {
      tests.push({
        name: 'Subdirectories are sorted by position',
        pass: false,
        expected: 'Platform category should exist',
        actual: 'Platform category not found'
      });
    }
    
    // Run tests
    tests.forEach((test, index) => {
      if (test.pass) {
        console.log(`✅ Test ${index + 1}: ${test.name}`);
        passCount++;
      } else {
        console.log(`❌ Test ${index + 1}: ${test.name}`);
        console.log(`   Expected: ${test.expected}`);
        console.log(`   Actual: ${test.actual}`);
        failCount++;
      }
    });
    
    console.log(`\nResults: ${passCount} passed, ${failCount} failed out of ${tests.length} tests.\n`);
    
    return passCount === tests.length;
    
  } catch (error) {
    console.error('Error running tests:', error);
    return false;
  }
}

// Test URL normalization
async function testUrlNormalization() {
  console.log('=== Testing URL Normalization ===\n');
  
  // Test URL normalization logic directly
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
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach((test, index) => {
    const result = normalizeUrlPath(test.input);
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
  
  // Also test generated URLs in llms.txt if available
  const llmsTxtPath = path.join(OUTPUT_DIR, 'llms.txt');
  try {
    await fs.access(llmsTxtPath);
    const content = await fs.readFile(llmsTxtPath, 'utf8');
    
    // Extract all URLs
    const urlPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const urls = [];
    let match;
    while ((match = urlPattern.exec(content)) !== null) {
      urls.push(match[2]);
    }
    
    console.log(`\nChecking ${urls.length} URLs from generated file:\n`);
    
    urls.forEach((urlStr, index) => {
      try {
        const url = new URL(urlStr);
        const hasFileExtension = FILE_EXTENSION_PATTERN.test(url.pathname);
        const endsWithSlash = url.pathname.endsWith('/');
        
        if (hasFileExtension && endsWithSlash) {
          console.log(`❌ Generated URL ${index + 1}: ${urlStr}`);
          console.log(`   Should not end with / when it has a file extension`);
          failCount++;
        } else if (!hasFileExtension && !endsWithSlash) {
          console.log(`❌ Generated URL ${index + 1}: ${urlStr}`);
          console.log(`   Should end with / when it doesn't have a file extension`);
          failCount++;
        } else {
          passCount++;
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
  } catch (e) {
    // File not found, skip this part
  }
  
  console.log(`\nURL Normalization Results: ${passCount} passed, ${failCount} failed.\n`);
  
  return failCount === 0;
}

// Test description extraction (should only use frontmatter)
async function testDescriptionExtraction() {
  console.log('=== Testing Description Extraction ===\n');
  
  const matter = require('gray-matter');
  
  // Test case 1: Document with frontmatter description
  const docWithDescription = `---
title: Test Page
description: This is a description from frontmatter
---

# Test Header

This is content that should NOT be used as description.`;
  
  const { data: data1 } = matter(docWithDescription);
  const hasFrontmatterDescription = !!data1.description;
  
  // Test case 2: Document without frontmatter description
  const docWithoutDescription = `---
title: Test Page
---

# Test Header

This is content that should NOT be used as description.`;
  
  const { data: data2 } = matter(docWithoutDescription);
  const noFrontmatterDescription = !data2.description;
  
  let passCount = 0;
  let failCount = 0;
  
  if (hasFrontmatterDescription) {
    console.log('✅ Test 1: Frontmatter description is extracted');
    passCount++;
  } else {
    console.log('❌ Test 1: Frontmatter description not found');
    failCount++;
  }
  
  if (noFrontmatterDescription) {
    console.log('✅ Test 2: No description extracted when frontmatter is missing');
    passCount++;
  } else {
    console.log('❌ Test 2: Description should not be extracted from content');
    failCount++;
  }
  
  console.log(`\nDescription Extraction Results: ${passCount} passed, ${failCount} failed out of 2 tests.\n`);
  
  return failCount === 0;
}

// Main test runner
async function runTests() {
  console.log('Starting category organization and URL normalization tests...\n');
  
  try {
    // Setup
    await setupTestDocs();
    
    // Run tests
    const test1 = await testCategoryOrganization();
    const test2 = await testUrlNormalization();
    const test3 = await testDescriptionExtraction();
    
    // Summary
    console.log('=== Test Summary ===');
    console.log(`Category Organization: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`URL Normalization: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Description Extraction: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = test1 && test2 && test3;
    console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };

