import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execFileAsync = promisify(execFile);

export interface ReefConfig {
  suffix: string;
  executablePath: string;
}

export interface ReefResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

/**
 * Get reef configuration from VSCode settings
 */
export function getReefConfig(): ReefConfig {
  const config = vscode.workspace.getConfiguration('reef');
  return {
    suffix: config.get<string>('suffix') || '-reef',
    executablePath: config.get<string>('executablePath') || 'reef'
  };
}

/**
 * Execute a reef command
 * @param subcommand The reef subcommand (status, kick, recall, plug, unplug)
 * @param args Additional arguments for the command
 * @param cwd Working directory (defaults to workspace root)
 */
export async function executeReefCommand(
  subcommand: string,
  args: string[] = [],
  cwd?: string
): Promise<ReefResult> {
  const config = getReefConfig();
  const workspaceRoot = cwd || getWorkspaceRoot();

  if (!workspaceRoot) {
    throw new Error('No workspace folder is open');
  }

  // Build command arguments
  const commandArgs = ['--suffix=' + config.suffix, subcommand, ...args];

  try {
    const { stdout, stderr } = await execFileAsync(config.executablePath, commandArgs, {
      cwd: workspaceRoot,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    };
  } catch (error: any) {
    // execFile throws on non-zero exit codes
    return {
      success: false,
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message || 'Unknown error'
    };
  }
}

/**
 * Get the workspace root directory
 */
export function getWorkspaceRoot(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Get the relative path of a file from the workspace root
 * @param filePath Absolute file path
 */
export function getRelativePath(filePath: string): string | undefined {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return undefined;
  }
  return path.relative(workspaceRoot, filePath);
}

/**
 * Get the active editor's file path (relative to workspace)
 */
export function getActiveFilePath(): string | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return undefined;
  }
  return getRelativePath(editor.document.uri.fsPath);
}
