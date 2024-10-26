import { exec } from '../../../../../../src/server/exec.mjs'


export async function coderunner(result, prompt_struct) {
	let jsrunner = result.match(/(\n|^)```run-js\n(?<code>[^]*)\n```/)?.groups?.code
	if (jsrunner) {
		console.log('AI运行的JS代码：', jsrunner)
		let coderesult
		try { coderesult = eval(jsrunner) } catch (err) { coderesult = err }
		console.log('coderesult', coderesult)
		prompt_struct.char_prompt.additional_chat_log.push({
			name: 'system',
			role: 'system',
			content: '你运行了JS代码：\n' + jsrunner + '\n执行结果：\n' + coderesult,
			files: []
		})
		return true
	}
	let pwshrunner = result.match(/(\n|^)```run-pwsh\n(?<code>[^]*)\n```/)?.groups?.code
	if (pwshrunner) {
		console.log('AI运行的Powershell代码：', pwshrunner)
		let pwshresult
		try { pwshresult = await exec(pwshrunner, { 'shell': 'pwsh.exe' }) } catch (err) { pwshresult = err }
		console.log('pwshresult', pwshresult)
		prompt_struct.char_prompt.additional_chat_log.push({
			name: 'system',
			role: 'system',
			content: '你运行了Powershell代码：\n' + pwshrunner + '\n执行结果：\nstdout：\n' + pwshresult.stdout + '\nstderr：\n' + pwshresult.stderr,
			files: []
		})
		return true
	}

	return false
}
