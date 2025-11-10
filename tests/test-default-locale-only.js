/**
 * Test script for default locale only generation feature
 * 
 * Tests that llms.txt is only generated for the default locale,
 * not for other locales in a multi-language Docusaurus site.
 * 
 * Run with: node tests/test-default-locale-only.js
 */

const fs = require('fs');
const path = require('path');
const pluginModule = require('../lib/index');
const plugin = pluginModule.default;

// Create test directory structure
const TEST_DIR = path.join(__dirname, '..', 'test-docs');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output', 'default-locale-test');

// Setup test docs structure with i18n
// Uses existing English docs in test-docs/docs as default locale (en)
// Adds Chinese translations in i18n/zh-Hans as a secondary language
async function setupTestDocs() {
  console.log('Setting up test docs with i18n structure...');
  
  // Create directories
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  
  const docsDir = path.join(TEST_DIR, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const i18nDir = path.join(TEST_DIR, 'i18n');
  if (!fs.existsSync(i18nDir)) {
    fs.mkdirSync(i18nDir, { recursive: true });
  }
  
  const zhHansDir = path.join(i18nDir, 'zh-Hans', 'docusaurus-plugin-content-docs', 'current');
  if (!fs.existsSync(zhHansDir)) {
    fs.mkdirSync(zhHansDir, { recursive: true });
  }
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Note: test-docs/docs already contains English docs (default locale: en)
  // We don't need to create them, they already exist
  
  // Create Chinese locale docs in i18n (zh-Hans as secondary language)
  fs.writeFileSync(
    path.join(zhHansDir, 'index.md'),
    '---\ntitle: 首页\ndescription: 欢迎使用测试文档。\n---\n\n# 首页\n\n欢迎使用测试文档。'
  );
  
  fs.writeFileSync(
    path.join(zhHansDir, 'getting-started.md'),
    '---\ntitle: 快速开始\ndescription: 这是快速开始指南。\n---\n\n# 快速开始\n\n这是快速开始指南。'
  );
  
  // Create a few more Chinese translations to match some existing English docs
  fs.writeFileSync(
    path.join(zhHansDir, 'faq.md'),
    '---\ntitle: 常见问题\ndescription: 常见问题解答。\n---\n\n# 常见问题\n\n这里是常见问题解答。'
  );
  
  fs.writeFileSync(
    path.join(zhHansDir, 'changelog.md'),
    '---\ntitle: 更新日志\ndescription: 版本更新记录。\n---\n\n# 更新日志\n\n这里是版本更新记录。'
  );
}

// Test default locale build (en)
async function testDefaultLocale() {
  console.log('\n=== Test 1: Default locale (en) build ===');
  
  const defaultLocaleOutDir = path.join(OUTPUT_DIR, 'en');
  if (!fs.existsSync(defaultLocaleOutDir)) {
    fs.mkdirSync(defaultLocaleOutDir, { recursive: true });
  }
  
  const mockContext = {
    siteDir: TEST_DIR,
    siteConfig: {
      title: 'Test Site',
      tagline: 'Testing default locale only',
      url: 'https://example.com',
      baseUrl: '/',
      i18n: {
        defaultLocale: 'en',
        locales: ['en', 'zh-Hans'],
      },
    },
    outDir: defaultLocaleOutDir, // Default locale builds to base outDir
  };
  
  const pluginInstance = plugin(mockContext, {
    generateLLMsTxt: true,
    generateLLMsFullTxt: false,
    llmsTxtFilename: 'llms.txt',
    docsDir: 'docs',
  });
  
  await pluginInstance.postBuild();
  
  // Verify llms.txt was generated
  const llmsTxtPath = path.join(defaultLocaleOutDir, 'llms.txt');
  if (fs.existsSync(llmsTxtPath)) {
    const content = fs.readFileSync(llmsTxtPath, 'utf8');
    console.log('✓ llms.txt generated for default locale');
    console.log(`  File size: ${content.length} bytes`);
    console.log(`  Contains English content: ${content.includes('Home') || content.includes('Getting Started')}`);
    return true;
  } else {
    console.log('✗ llms.txt NOT generated for default locale');
    return false;
  }
}

// Test non-default locale build (zh-Hans)
async function testNonDefaultLocale() {
  console.log('\n=== Test 2: Non-default locale (zh-Hans) build ===');
  
  const zhHansOutDir = path.join(OUTPUT_DIR, 'zh-Hans');
  if (!fs.existsSync(zhHansOutDir)) {
    fs.mkdirSync(zhHansOutDir, { recursive: true });
  }
  
  const mockContext = {
    siteDir: TEST_DIR,
    siteConfig: {
      title: 'Test Site',
      tagline: 'Testing default locale only',
      url: 'https://example.com',
      baseUrl: '/',
      i18n: {
        defaultLocale: 'en',
        locales: ['en', 'zh-Hans'],
      },
    },
    outDir: zhHansOutDir, // Non-default locale builds to locale subdirectory
  };
  
  const pluginInstance = plugin(mockContext, {
    generateLLMsTxt: true,
    generateLLMsFullTxt: false,
    llmsTxtFilename: 'llms.txt',
    docsDir: 'docs',
  });
  
  await pluginInstance.postBuild();
  
  // Verify llms.txt was NOT generated
  const llmsTxtPath = path.join(zhHansOutDir, 'llms.txt');
  if (!fs.existsSync(llmsTxtPath)) {
    console.log('✓ llms.txt correctly NOT generated for non-default locale');
    return true;
  } else {
    console.log('✗ llms.txt incorrectly generated for non-default locale');
    const content = fs.readFileSync(llmsTxtPath, 'utf8');
    console.log(`  File size: ${content.length} bytes`);
    return false;
  }
}

// Test locale detection from outDir path
async function testLocaleDetectionFromOutDir() {
  console.log('\n=== Test 3: Locale detection from outDir path ===');
  
  const baseTestDir = path.join(OUTPUT_DIR, 'locale-detection-base');
  const testCases = [
    {
      name: 'Default locale - base outDir',
      outDir: baseTestDir,
      expectedLocale: 'en',
      shouldGenerate: true,
    },
    {
      name: 'Chinese locale - zh-Hans subdirectory',
      outDir: path.join(baseTestDir, 'zh-Hans'),
      expectedLocale: 'zh-Hans',
      shouldGenerate: false,
    },
    {
      name: 'French locale - fr subdirectory',
      outDir: path.join(baseTestDir, 'fr'),
      expectedLocale: 'fr',
      shouldGenerate: false,
    },
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    // Create the full outDir path including locale subdirectories
    const fullOutDir = testCase.outDir;
    if (!fs.existsSync(fullOutDir)) {
      fs.mkdirSync(fullOutDir, { recursive: true });
    }
    
    const mockContext = {
      siteDir: TEST_DIR,
      siteConfig: {
        title: 'Test Site',
        tagline: 'Testing locale detection',
        url: 'https://example.com',
        baseUrl: '/',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'zh-Hans', 'fr'],
        },
      },
      outDir: fullOutDir,
    };
    
    const pluginInstance = plugin(mockContext, {
      generateLLMsTxt: true,
      generateLLMsFullTxt: false,
      llmsTxtFilename: 'llms.txt',
      docsDir: 'docs',
    });
    
    await pluginInstance.postBuild();
    
    const llmsTxtPath = path.join(fullOutDir, 'llms.txt');
    const wasGenerated = fs.existsSync(llmsTxtPath);
    
    if (wasGenerated === testCase.shouldGenerate) {
      console.log(`✓ ${testCase.name}: ${wasGenerated ? 'Generated' : 'Skipped'} (expected)`);
      passed++;
    } else {
      console.log(`✗ ${testCase.name}: ${wasGenerated ? 'Generated' : 'Skipped'} (expected ${testCase.shouldGenerate ? 'generated' : 'skipped'})`);
    }
  }
  
  console.log(`\nLocale detection tests: ${passed}/${total} passed`);
  return passed === total;
}

// Verify results
function verifyResults() {
  console.log('\n=== Verifying Results ===');
  
  const enFile = path.join(OUTPUT_DIR, 'en', 'llms.txt');
  const zhHansFile = path.join(OUTPUT_DIR, 'zh-Hans', 'llms.txt');
  
  const enExists = fs.existsSync(enFile);
  const zhHansExists = fs.existsSync(zhHansFile);
  
  console.log(`Default locale (en) llms.txt exists: ${enExists ? '✓' : '✗'}`);
  console.log(`Non-default locale (zh-Hans) llms.txt exists: ${zhHansExists ? '✗ (should not exist)' : '✓ (correctly skipped)'}`);
  
  if (enExists) {
    const content = fs.readFileSync(enFile, 'utf8');
    console.log(`\nDefault locale file preview (first 200 chars):`);
    console.log(content.substring(0, 200) + '...');
  }
  
  return enExists && !zhHansExists;
}

// Clean up test files
function cleanup() {
  console.log('\nCleaning up...');
  // Uncomment to remove test files after running
  // if (fs.existsSync(OUTPUT_DIR)) {
  //   fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  // }
}

// Run the tests
async function main() {
  try {
    await setupTestDocs();
    
    const test1Passed = await testDefaultLocale();
    const test2Passed = await testNonDefaultLocale();
    const test3Passed = await testLocaleDetectionFromOutDir();
    
    const allPassed = verifyResults();
    
    cleanup();
    
    if (test1Passed && test2Passed && test3Passed && allPassed) {
      console.log('\n✓ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n✗ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

