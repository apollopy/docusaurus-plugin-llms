/**
 * Unit tests for slug-based URL generation
 * 
 * Tests that URLs are correctly generated from frontmatter slug/id fields
 * when generating llms.txt files.
 * 
 * Run with: node tests/test-slug-url-generation.js
 */

const fs = require('fs');
const path = require('path');
const pluginModule = require('../lib/index');
const plugin = pluginModule.default;

const TEST_DIR = path.join(__dirname, '..', 'test-docs-slug');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output', 'slug-test');

// Setup test docs with various slug configurations
async function setupTestDocs() {
  console.log('Setting up test docs with slug configurations...');
  
  // Create directories
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  
  const docsDir = path.join(TEST_DIR, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const apiDir = path.join(docsDir, 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Test case 1: Relative slug (replaces last segment)
  fs.writeFileSync(
    path.join(apiDir, 'core.md'),
    `---
title: Core API
slug: api-reference
---

# Core API

This is the core API documentation.
`
  );
  
  // Test case 2: Absolute slug (starts with /)
  fs.writeFileSync(
    path.join(apiDir, 'advanced.md'),
    `---
title: Advanced API
slug: /docs/advanced-api-reference
---

# Advanced API

This is the advanced API documentation.
`
  );
  
  // Test case 3: Using id instead of slug
  fs.writeFileSync(
    path.join(docsDir, 'getting-started.md'),
    `---
title: Getting Started
id: quick-start-guide
---

# Getting Started

This is the getting started guide.
`
  );
  
  // Test case 4: No slug or id (should use file path)
  fs.writeFileSync(
    path.join(docsDir, 'index.md'),
    `---
title: Home
---

# Home Page

Welcome to the documentation.
`
  );
  
  // Ensure guides directory exists before writing file
  const guidesDir = path.join(docsDir, 'guides');
  if (!fs.existsSync(guidesDir)) {
    fs.mkdirSync(guidesDir, { recursive: true });
  }
  
  // Test case 5: Slug with nested path (slug replaces last segment)
  fs.writeFileSync(
    path.join(guidesDir, 'tutorial.md'),
    `---
title: Tutorial
slug: step-by-step-tutorial
---

# Tutorial

This is a tutorial guide.
`
  );
  
  // Ensure reference directory exists before writing file
  const referenceDir = path.join(docsDir, 'reference');
  if (!fs.existsSync(referenceDir)) {
    fs.mkdirSync(referenceDir, { recursive: true });
  }
  
  // Test case 6: Slug with path transformation (ignorePaths)
  fs.writeFileSync(
    path.join(referenceDir, 'api.md'),
    `---
title: API Reference
slug: api-docs
---

# API Reference

This is the API reference.
`
  );
}

// Test slug URL generation
async function testSlugUrlGeneration() {
  console.log('\n=== Test: Slug URL Generation ===');
  
  const mockContext = {
    siteDir: TEST_DIR,
    siteConfig: {
      title: 'Test Site',
      tagline: 'Testing slug URL generation',
      url: 'https://example.com',
      baseUrl: '/',
    },
    outDir: OUTPUT_DIR,
  };
  
  const pluginInstance = plugin(mockContext, {
    generateLLMsTxt: true,
    generateLLMsFullTxt: false,
    llmsTxtFilename: 'llms.txt',
    docsDir: 'docs',
  });
  
  await pluginInstance.postBuild();
  
  // Read the generated llms.txt
  const llmsTxtPath = path.join(OUTPUT_DIR, 'llms.txt');
  if (!fs.existsSync(llmsTxtPath)) {
    console.log('✗ llms.txt was not generated');
    return false;
  }
  
  const content = fs.readFileSync(llmsTxtPath, 'utf8');
  console.log('\nGenerated llms.txt content:');
  console.log(content);
  
  // Test assertions
  const tests = [
    {
      name: 'Relative slug replaces last segment',
      pattern: /docs\/api\/api-reference/,
      expected: 'docs/api/api-reference',
      description: 'core.md with slug: api-reference should generate docs/api/api-reference'
    },
    {
      name: 'Absolute slug used as-is',
      pattern: /docs\/advanced-api-reference/,
      expected: 'docs/advanced-api-reference',
      description: 'advanced.md with slug: /docs/advanced-api-reference should generate docs/advanced-api-reference'
    },
    {
      name: 'Id used when slug not present',
      pattern: /docs\/quick-start-guide/,
      expected: 'docs/quick-start-guide',
      description: 'getting-started.md with id: quick-start-guide should generate docs/quick-start-guide'
    },
    {
      name: 'File path used when no slug or id',
      pattern: /https:\/\/example\.com\/docs\/["\)]/,
      expected: 'https://example.com/docs/',
      description: 'index.md without slug/id should use file path docs/ (index files become root)'
    },
    {
      name: 'Slug with nested path',
      pattern: /docs\/guides\/step-by-step-tutorial/,
      expected: 'docs/guides/step-by-step-tutorial',
      description: 'tutorial.md with slug: step-by-step-tutorial should generate docs/guides/step-by-step-tutorial'
    },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    if (test.pattern.test(content)) {
      console.log(`✓ ${test.name}: Found expected URL pattern`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: Expected URL pattern not found`);
      console.log(`  Expected: ${test.expected}`);
      failed++;
    }
  }
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test slug with path transformation
async function testSlugWithPathTransformation() {
  console.log('\n=== Test: Slug with Path Transformation ===');
  
  const testOutputDir = path.join(OUTPUT_DIR, 'path-transform');
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }
  
  const mockContext = {
    siteDir: TEST_DIR,
    siteConfig: {
      title: 'Test Site',
      tagline: 'Testing slug with path transformation',
      url: 'https://example.com',
      baseUrl: '/',
    },
    outDir: testOutputDir,
  };
  
  const pluginInstance = plugin(mockContext, {
    generateLLMsTxt: true,
    generateLLMsFullTxt: false,
    llmsTxtFilename: 'llms.txt',
    docsDir: 'docs',
    pathTransformation: {
      ignorePaths: ['reference'],
    },
  });
  
  await pluginInstance.postBuild();
  
  const llmsTxtPath = path.join(testOutputDir, 'llms.txt');
  if (!fs.existsSync(llmsTxtPath)) {
    console.log('✗ llms.txt was not generated');
    return false;
  }
  
  const content = fs.readFileSync(llmsTxtPath, 'utf8');
  
  // Check that 'reference' is removed from the path
  // api.md is in docs/reference/api.md with slug: api-docs
  // After ignoring 'reference', it should be docs/api-docs
  if (content.includes('docs/api-docs')) {
    console.log('✓ Path transformation correctly applied to slug');
    return true;
  } else {
    console.log('✗ Path transformation not correctly applied to slug');
    console.log('  Content:', content);
    return false;
  }
}

// Clean up test files
function cleanup() {
  console.log('\nCleaning up...');
  try {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    console.log('✓ Cleanup complete');
  } catch (err) {
    console.warn('Warning: Error during cleanup:', err.message);
  }
}

// Main test runner
async function main() {
  try {
    await setupTestDocs();
    
    const test1Passed = await testSlugUrlGeneration();
    const test2Passed = await testSlugWithPathTransformation();
    
    if (test1Passed && test2Passed) {
      console.log('\n✓ All tests passed!');
      cleanup();
      process.exit(0);
    } else {
      console.log('\n✗ Some tests failed');
      cleanup();
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    cleanup();
    process.exit(1);
  }
}

main();

