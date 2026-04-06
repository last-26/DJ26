import chalk from 'chalk';

const timestamp = () => new Date().toLocaleTimeString('tr-TR');

export const logger = {
  info: (message, ...args) => {
    console.log(chalk.blue(`[${timestamp()}] ℹ INFO:`), message, ...args);
  },
  success: (message, ...args) => {
    console.log(chalk.green(`[${timestamp()}] ✓ SUCCESS:`), message, ...args);
  },
  warn: (message, ...args) => {
    console.warn(chalk.yellow(`[${timestamp()}] ⚠ WARN:`), message, ...args);
  },
  error: (message, ...args) => {
    console.error(chalk.red(`[${timestamp()}] ✖ ERROR:`), message, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(chalk.gray(`[${timestamp()}] 🔍 DEBUG:`), message, ...args);
    }
  },
};
