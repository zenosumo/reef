import * as vscode from 'vscode';
import { executeReefCommand, getActiveFilePath, getWorkspaceRoot } from './reefCli';

export function activate(context: vscode.ExtensionContext) {
	console.log('Reef extension is now active!');

	// Register all reef commands
	context.subscriptions.push(
		vscode.commands.registerCommand('reef.status', async () => {
			await handleReefStatus();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('reef.kickCurrent', async () => {
			await handleReefKickCurrent();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('reef.recallCurrent', async () => {
			await handleReefRecallCurrent();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('reef.plugAll', async () => {
			await handleReefPlugAll();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('reef.unplugAll', async () => {
			await handleReefUnplugAll();
		})
	);
}

export function deactivate() {}

/**
 * Handle reef status command
 */
async function handleReefStatus() {
	try {
		if (!getWorkspaceRoot()) {
			vscode.window.showErrorMessage('No workspace folder is open');
			return;
		}

		const result = await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Running reef status...',
				cancellable: false
			},
			async () => {
				return await executeReefCommand('status');
			}
		);

		if (result.success) {
			// Show status in an output channel for better formatting
			const outputChannel = vscode.window.createOutputChannel('Reef Status');
			outputChannel.clear();
			outputChannel.appendLine(result.stdout);
			outputChannel.show();
		} else {
			vscode.window.showErrorMessage(`Reef status failed: ${result.stderr}`);
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Reef status error: ${error.message}`);
	}
}

/**
 * Handle reef kick current file command
 */
async function handleReefKickCurrent() {
	try {
		const filePath = getActiveFilePath();
		if (!filePath) {
			vscode.window.showErrorMessage('No active file to kick');
			return;
		}

		const result = await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Kicking ${filePath}...`,
				cancellable: false
			},
			async () => {
				return await executeReefCommand('kick', [filePath]);
			}
		);

		if (result.success) {
			vscode.window.showInformationMessage(`✓ Kicked: ${filePath}`);
		} else {
			vscode.window.showErrorMessage(`Failed to kick ${filePath}: ${result.stderr}`);
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Reef kick error: ${error.message}`);
	}
}

/**
 * Handle reef recall current file command
 */
async function handleReefRecallCurrent() {
	try {
		const filePath = getActiveFilePath();
		if (!filePath) {
			vscode.window.showErrorMessage('No active file to recall');
			return;
		}

		const result = await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Recalling ${filePath}...`,
				cancellable: false
			},
			async () => {
				return await executeReefCommand('recall', [filePath]);
			}
		);

		if (result.success) {
			vscode.window.showInformationMessage(`✓ Recalled: ${filePath}`);
		} else {
			vscode.window.showErrorMessage(`Failed to recall ${filePath}: ${result.stderr}`);
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Reef recall error: ${error.message}`);
	}
}

/**
 * Handle reef plug all command
 */
async function handleReefPlugAll() {
	try {
		if (!getWorkspaceRoot()) {
			vscode.window.showErrorMessage('No workspace folder is open');
			return;
		}

		const result = await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Plugging all twin files...',
				cancellable: false
			},
			async () => {
				return await executeReefCommand('plug');
			}
		);

		if (result.success) {
			vscode.window.showInformationMessage('✓ Successfully plugged all twin files');
		} else {
			vscode.window.showErrorMessage(`Reef plug failed: ${result.stderr}`);
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Reef plug error: ${error.message}`);
	}
}

/**
 * Handle reef unplug all command
 */
async function handleReefUnplugAll() {
	try {
		if (!getWorkspaceRoot()) {
			vscode.window.showErrorMessage('No workspace folder is open');
			return;
		}

		const result = await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Unplugging all twin symlinks...',
				cancellable: false
			},
			async () => {
				return await executeReefCommand('unplug');
			}
		);

		if (result.success) {
			vscode.window.showInformationMessage('✓ Successfully unplugged all twin symlinks');
		} else {
			vscode.window.showErrorMessage(`Reef unplug failed: ${result.stderr}`);
		}
	} catch (error: any) {
		vscode.window.showErrorMessage(`Reef unplug error: ${error.message}`);
	}
}
