import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function checkFile(filePath) {
	try {
		fs.accessSync(filePath, fs.constants.F_OK)
		console.log(`✅ ${filePath} encontrado`)
		return true
	} catch (err) {
		console.error(`❌ ${filePath} não encontrado`)
		return false
	}
}

function checkDependencies() {
	const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
	const requiredDeps = [
		'@remix-run/node',
		'@remix-run/react',
		'zustand',
		'@radix-ui/react-navigation-menu',
		'@radix-ui/react-dialog',
		'@radix-ui/react-tabs',
		'@radix-ui/react-tooltip'
	]

	const missingDeps = requiredDeps.filter(
		dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
	)

	if (missingDeps.length > 0) {
		console.error('❌ Dependências faltando:', missingDeps.join(', '))
		return false
	}

	console.log('✅ Todas as dependências necessárias estão instaladas')
	return true
}

async function checkTailwindConfig() {
	try {
		const { default: tailwindConfig } = await import('../tailwind.config.js')
		if (!tailwindConfig.content || !tailwindConfig.theme) {
			console.error('❌ Configuração do Tailwind incompleta')
			return false
		}
		console.log('✅ Configuração do Tailwind válida')
		return true
	} catch (err) {
		console.error('❌ Erro ao verificar configuração do Tailwind:', err.message)
		return false
	}
}

async function main() {
	console.log('🔍 Iniciando verificações...\n')

	const essentialFiles = [
		'app/root.tsx',
		'app/entry.client.tsx',
		'app/entry.server.tsx',
		'app/tailwind.css',
		'tailwind.config.js',
		'tsconfig.json',
		'package.json',
		'.env'
	]

	const allFilesExist = essentialFiles.every(file => checkFile(file))
	const depsOk = checkDependencies()
	const tailwindOk = await checkTailwindConfig()

	console.log('\n📋 Resumo das verificações:')
	if (allFilesExist && depsOk && tailwindOk) {
		console.log('✅ Todas as verificações passaram!')
		process.exit(0)
	} else {
		console.error('❌ Algumas verificações falharam')
		process.exit(1)
	}
}

main().catch(error => {
	console.error('❌ Erro inesperado:', error)
	process.exit(1)
}) 