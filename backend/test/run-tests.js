/**
 * Test Runner for Football Field Management System
 * 
 * This script runs all tests for the application.
 */

const chalk = require('chalk');
const apiTests = require('./api/api-test');

async function runAllTests() {
  console.log(chalk.bold.blue('=== Football Field Management System Tests ==='));
  console.log(chalk.blue('Running all tests...'));
  console.log(chalk.blue('----------------------------------------'));
  
  // Run API tests
  console.log(chalk.bold.yellow('Running API Tests:'));
  await apiTests.runTests();
  
  console.log(chalk.blue('----------------------------------------'));
  console.log(chalk.bold.green('All tests completed!'));
}

// Run the tests
runAllTests().catch(error => {
  console.error(chalk.red('Test execution failed:'), error);
});
