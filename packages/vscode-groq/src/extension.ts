/**
 * GROQ VS Code Extension
 *
 * Provides GROQ language support through the GROQ Language Server:
 * - Diagnostics (linting)
 * - Hover information
 * - Auto-completion
 * - Formatting
 */

import * as path from 'node:path'
import { workspace, window, commands, type ExtensionContext, type OutputChannel } from 'vscode'
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node'

let client: LanguageClient | undefined
let outputChannel: OutputChannel | undefined

/**
 * Activates the extension
 */
export async function activate(context: ExtensionContext): Promise<void> {
  // Check if extension is enabled
  const config = workspace.getConfiguration('groq')
  if (!config.get<boolean>('enable', true)) {
    return
  }

  // Create output channel
  outputChannel = window.createOutputChannel('GROQ')
  context.subscriptions.push(outputChannel)

  // Start the language client
  await startClient(context)

  // Register commands
  registerCommands(context)

  outputChannel.appendLine('GROQ extension activated')
}

/**
 * Deactivates the extension
 */
export async function deactivate(): Promise<void> {
  if (client) {
    await client.stop()
    client = undefined
  }
}

/**
 * Starts the language client
 */
async function startClient(context: ExtensionContext): Promise<void> {
  // Find the server module
  const serverModule = await findServerModule(context)
  if (!serverModule) {
    outputChannel?.appendLine('Could not find GROQ language server module')
    window.showErrorMessage(
      'GROQ: Could not find language server. Please ensure @sanity/groq-lsp is installed.'
    )
    return
  }

  outputChannel?.appendLine(`Using server module: ${serverModule}`)

  // Server options
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        execArgv: ['--nolazy', '--inspect=6009'],
      },
    },
  }

  // Get trace setting
  const traceServer = workspace.getConfiguration('groq').get<string>('trace.server', 'off')

  // Client options - only include outputChannel if defined
  const clientOptions: LanguageClientOptions = {
    // Documents to activate on
    documentSelector: [
      { scheme: 'file', language: 'groq' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'typescriptreact' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'javascriptreact' },
    ],
    synchronize: {
      // Notify server about file changes to schema files
      fileEvents: workspace.createFileSystemWatcher('**/schema.json'),
    },
    initializationOptions: {
      schemaPath: workspace.getConfiguration('groq').get<string>('schemaPath'),
      maxDiagnostics: workspace.getConfiguration('groq').get<number>('maxDiagnostics', 100),
      enableFormatting: workspace.getConfiguration('groq').get<boolean>('enableFormatting', true),
    },
  }

  // Add output channel if available
  if (outputChannel) {
    clientOptions.outputChannel = outputChannel
    clientOptions.traceOutputChannel = outputChannel
  }

  // Create the client
  client = new LanguageClient('groq', 'GROQ Language Server', serverOptions, clientOptions)

  // Set trace level
  if (traceServer !== 'off') {
    client.setTrace(traceServer === 'verbose' ? 2 : 1)
  }

  // Start the client and wait for it to be ready
  await client.start()
  outputChannel?.appendLine('GROQ Language Server started')

  // Register disposable for cleanup
  context.subscriptions.push({
    dispose: () => client?.stop(),
  })
}

/**
 * Find the server module path
 */
async function findServerModule(context: ExtensionContext): Promise<string | undefined> {
  outputChannel?.appendLine('Looking for GROQ language server...')

  // 1. For development: try sibling package in monorepo FIRST
  const devServer = context.asAbsolutePath(path.join('..', 'groq-lsp', 'dist', 'server.js'))
  outputChannel?.appendLine(`Checking dev server: ${devServer}`)
  if (await fileExists(devServer)) {
    outputChannel?.appendLine('Found dev server in monorepo')
    return devServer
  }

  // 2. Try bundled server (when extension is packaged)
  const bundledServer = context.asAbsolutePath(path.join('server', 'dist', 'server.js'))
  outputChannel?.appendLine(`Checking bundled server: ${bundledServer}`)
  if (await fileExists(bundledServer)) {
    outputChannel?.appendLine('Found bundled server')
    return bundledServer
  }

  // 3. Try workspace node_modules
  const workspaceFolders = workspace.workspaceFolders
  if (workspaceFolders && workspaceFolders.length > 0) {
    const workspaceRoot = workspaceFolders[0]?.uri.fsPath
    if (workspaceRoot) {
      const workspaceServer = path.join(
        workspaceRoot,
        'node_modules',
        '@sanity',
        'groq-lsp',
        'dist',
        'server.js'
      )
      outputChannel?.appendLine(`Checking workspace node_modules: ${workspaceServer}`)
      if (await fileExists(workspaceServer)) {
        outputChannel?.appendLine('Found server in workspace node_modules')
        return workspaceServer
      }
    }
  }

  outputChannel?.appendLine('No server found')
  return undefined
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fs = await import('node:fs/promises')
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Register extension commands
 */
function registerCommands(context: ExtensionContext): void {
  // Restart server command
  context.subscriptions.push(
    commands.registerCommand('groq.restartServer', async () => {
      outputChannel?.appendLine('Restarting GROQ Language Server...')

      if (client) {
        await client.stop()
        client = undefined
      }

      await startClient(context)
      window.showInformationMessage('GROQ Language Server restarted')
    })
  )

  // Show output command
  context.subscriptions.push(
    commands.registerCommand('groq.showOutput', () => {
      outputChannel?.show()
    })
  )
}
